/* eslint unicorn/no-process-exit: "off" */

const {spawn} = require('child_process')

const chokidar = require('chokidar')
const debounce = require('lodash.debounce')
const once = require('once')

const pkg = require('./package.json')

const defaults = {
	ignore: [],
	verbose: false,
	watch: [],
	lazy: false
}

module.exports = (command, options = {}) => {
	const opts = Object.assign(defaults, options)

	if (typeof command !== 'string') {
		throw new TypeError(`command must be a string, got ${typeof command}`)
	}

	if (command.length === 0) {
		throw new Error('command\'s length must be greater than 0')
	}

	if (!Array.isArray(opts.ignore)) {
		opts.ignore = [opts.ignore]
	}

	if (!Array.isArray(opts.watch)) {
		opts.watch = [opts.watch]
	}

	const log = opts.verbose ? require('./lib/logger') : () => {}

	const leadMsg = 'starting with config:\n' +
		`\tcommand: ${command}\n` +
		`\twatch: ${opts.watch.join(', ')}\n` +
		`\tignore: ${opts.ignore.join(', ')}`

	log('info', leadMsg)

	let ref
	const execute = () => {
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

		ref = spawn(sh, [flag, command], {
			stdio: ['pipe', process.stdout, process.stderr]
		})

		ref.on('close', code => {
			if (code !== null) {
				// Child exited on its own
				if (code === 0) {
					log('success', 'command exited without error, ' +
						'waiting for changes...')
				} else {
					log('error', `command exited with code ${code}, ` +
						'waiting for changes...')
				}
				ref = null
			}
		})
	}

	// Attach watcher
	const watcher = chokidar.watch(opts.watch, {
		ignored: opts.ignore,
		ignoreInitial: true
	})

	const x = debounce(execute, 10)

	watcher.on('all', x)

	if (!options.lazy) {
		x()
	}

	const cleanup = once(() => {
		if (ref) {
			log('info', 'cleaning up...')
			ref.kill('SIGINT')
		}

		watcher.close()
	})

	process.on('exit', cleanup)
	process.on('SIGINT', cleanup)
	process.on('uncaughtException', e => {
		log('error', `uncaught exception in ${pkg.name}, stack trace:`)
		log('error', e.stack)
		process.exit(1)
	})

	return {
		_options: opts,
		stop: cleanup
	}
}
