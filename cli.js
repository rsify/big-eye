#!/usr/bin/env node

const fs = require('fs')
const os = require('os')

const meow = require('meow')

const pkg = require('./package.json')
const logger = require('./lib/logger')

const bigEye = require('.')

const cli = meow(`
	Usage
	  $ eye <command>

	Options
	  -w, --watch    Files/directories to be watched [Default: pwd]
	  -i, --ignore   Files/directories to be ignored [Default: from .gitignore]
	  -l, --lazy     Don't execute command on startup
	  -d, --delay    Debounce delay in ms between command executions [Default: 10]
	  -q, --quiet    Print only command output

	Examples
	  $ eye node app.js
	  $ eye node build.js -w src/
	  $ eye python module.py -i *.pyc
	  $ eye 'g++ main.cpp && ./a.out'
`, {
	version: `${pkg.name} (${pkg.version})\n` +
		`maintained by ${pkg.author}\n` +
		`bug reports: ${pkg.bugs}`,
	flags: {
		watch: {
			alias: 'w',
			type: 'string'
		},
		ignore: {
			alias: 'w',
			type: 'string'
		},
		lazy: {
			alias: 'l',
			type: 'boolean',
			default: false
		},
		delay: {
			alias: 'd',
			type: 'string',
			default: 10
		},
		quiet: {
			alias: 'q',
			type: 'boolean',
			default: false
		}
	}
})

const flags = cli.flags

const mergeToArr = (x, y) => {
	if (typeof x === 'undefined') {
		x = []
	}

	if (typeof y === 'undefined') {
		y = []
	}

	if (!Array.isArray(x)) {
		x = [x]
	}
	if (!Array.isArray(y)) {
		y = [y]
	}

	const tmp = x.concat(y)
	return tmp.length === 0 ? null : tmp
}

const options = {}

if (flags.watch) {
	options.watch = mergeToArr(flags.w, flags.watch)
} else {
	options.watch = ['.']
}

let fromGitIgnore = false
if (flags.ignore) {
	options.ignore = mergeToArr(flags.i, flags.ignore)
} else if (fs.existsSync('.gitignore')) {
	const content = fs.readFileSync('.gitignore', 'utf8')
	options.ignore = content.split(os.EOL).filter(x => x.length !== 0)
	fromGitIgnore = true
}

options.lazy = flags.lazy

const command = cli.input.join(' ')

try {
	if (command.length === 0) {
		cli.showHelp()
	} else {
		const log = options.quiet ? () => {} : require('./lib/logger')
		const eye = bigEye(command, options)

		const leadMsg = 'starting with config:\n' +
			`\tcommand: ${command}\n` +
			`\twatch: ${options.watch.join(', ')}\n` +
			`\tignore: ${options.ignore.join(', ')}` +
			(fromGitIgnore ? ' (from .gitignore)' : '')

		log('info', leadMsg)

		eye.on('executing', () => {
			log('info', 'executing child...')
		})

		eye.on('changes', (event, path) => {
			log('info', `file changes detected (${event} ${path})`)
		})

		eye.on('success', time => {
			log('success', `command exited without error (${time}ms), ` +
				'waiting for changes...')
		})

		eye.on('failure', (time, code) => {
			log('error', `command exited with code ${code} (${time}ms), ` +
				'waiting for changes...')
		})

		eye.on('killed', signal => {
			log('info', `child killed (${signal})`)
		})
	}
} catch (err) {
	logger('error', err.stack)
	process.exit(1)
}
