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
	  -w, --watch    Files/directories to be watched. [Default: pwd]
	  -i, --ignore   Files/directories to be ignored. [Default: from .gitignore]
	  -q, --quiet    Print only command output

	Examples
	  $ eye node app.js
	  $ eye node build.js -w src/
	  $ eye python module.py -i *.pyc
	  $ eye 'g++ main.cpp && ./a.out'
`, {
	version: `${pkg.name} (${pkg.version})\n` +
		`maintained by ${pkg.author}\n` +
		`bug reports: ${pkg.bugs}`
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

if (flags.w || flags.watch) {
	options.watch = mergeToArr(flags.w, flags.watch)
} else {
	options.watch = ['.']
}

if (flags.i || flags.ignore) {
	options.ignore = mergeToArr(flags.i, flags.ignore)
} else if (fs.existsSync('.gitignore')) {
	const content = fs.readFileSync('.gitignore', 'utf8')
	options.ignore = content.split(os.EOL).filter(x => x.length !== 0)
}

options.command = cli.input.join(' ')
options.verbose = !(flags.quiet || flags.q)

try {
	if (options.command.length === 0) {
		cli.showHelp()
	} else {
		bigEye(options)
	}
} catch (err) {
	logger('error', err.stack)
	process.exit(1)
}
