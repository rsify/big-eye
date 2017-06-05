const debounce = require('debounce')
const fs = require('fs')
const minimatch = require('minimatch')
const once = require('once')
const path = require('path')
const pkg = require('./package.json')
const spawn = require('child_process').spawn

const defaults = {
	ignore: ['.git', 'node_modules'],
	root: path.resolve(),
	verbose: false,
	watch: ['.'],
}

module.exports = (options = {}) => {
	const opts = Object.assign(defaults, options)

	if (!opts.command) throw 'command not specified'

	if (!Array.isArray(opts.ignore)) opts.ignore = [opts.ignore]
	if (!Array.isArray(opts.watch)) opts.watch = [opts.watch]

	opts.ignore = opts.ignore.map(x => path.resolve(x))

	const log = opts.verbose ? require('./lib/logger') : () => {}

	const watchSet = new Set()
	const watchResolved = opts.watch.map(x => path.resolve(x))

	const leadMsg = 'starting with config:\n' +
		`\tcommand: ${opts.command}\n` +
		`\twatch: ${opts.watch.join(', ')}\n` +
		`\tignore: ${opts.ignore.join(', ')}`

	log('info', leadMsg)

	const add = (p) => {
		if (!isIgnored(p)) watchSet.add(p)
	}

	const isIgnored = (p) => {
		for (const ig of opts.ignore)
			if (minimatch(p, ig)) return true
		return false
	}

	const walk = (p) => {
		const children = fs.readdirSync(p)

		for (const child of children) {
			const resolved = path.resolve(p, child)

			const stats = fs.statSync(resolved)

			if (stats.isDirectory()) {
				add(resolved)
				walk(resolved)
			}
		}
	}

	for (const p of watchResolved) {
		const stats = fs.statSync(p)

		if (stats.isDirectory()) {
			add(p)
			if (p !== path.resolve('.'))
				walk(p)
		} else watchSet.add(p)
	}

	let ref
	const execute = (ex) => {
		if (ref) {
			ref.kill('SIGTERM')
			log('info', 'file changes detected, restarting...')
		}

		let sh = 'sh'
		let flag = '-c'

		if (process.platform === 'win32') {
			sh = 'cmd'
			flag = '/c'
		}

		ref = spawn(sh, [flag, ex], {
			stdio: ['pipe', process.stdout, process.stderr]
		})

		ref.on('close', code => {
			if (code !== null) {
				// child exited on its own
				if (code === 0)
					log('success', 'command exited without error, ' +
						'waiting for changes...')
				else
					log('error', `command exited with code ${code}, ` +
						'waiting for changes...')
				ref = null
			}
		})
	}

	// attach watchers
	for (const p of watchSet) {
		fs.watch(p, {
			persistent: false
		}, debounce((event, file) => {
			if (!isIgnored(path.resolve(p, file)))
				execute(opts.command)
		}))
	}

	// initial execution
	execute(opts.command)

	const cleanup = once((isErr) => {
		if (ref) {
			log('info', 'cleaning up...')
			ref.kill('SIGINT')
		}
		process.exit(1)
	})

	process.on('exit', cleanup)
	process.on('SIGINT', cleanup)
	process.on('uncaughtException', (e) => {
		log('error', 'uncaught exception in ${pkg.name}, stack trace:')
		log('error', e.stack)
		process.exit(1)
	})

	// force the process to keep being alive
	const interval = setInterval(() => {}, 50000)
	return {
		_options: opts,
		stop: () => interval.unref()
	}
}
