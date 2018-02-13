#!/usr/bin/env node
'use strict'

/* istanbul ignore file */

const meow = require('meow')

const Logger = require('./lib/logger')

const helpers = require('./lib/cli-helpers')

const flagsToOptions = helpers.flagsToOptions
const parseCommand = helpers.parseCommand

const cwd = process.cwd()

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
	  $ eye app.js
	  $ eye build.js -w src/
	  $ eye python module.py -i '*.pyc'
	  $ eye 'g++ main.cpp && ./a.out'

	Tips
	  Run eye without arguments to execute the npm start script.
`, {
	flags: {
		watch: {
			alias: 'w',
			type: 'string'
		},
		ignore: {
			alias: 'i',
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

const options = flagsToOptions(cwd, cli.flags)

const logger = new Logger(process.stdout, {
	quiet: options.quiet
})

let command
try {
	command = parseCommand(cwd, cli.input.join(' '))
} catch (err) {
	logger.updateState('error', {msg: err.message})
	cli.showHelp()
}

try {
	if (command.length === 0) {
		cli.showHelp()
	} else {
		const eye = bigEye(command.file, command.args, options)

		logger.updateState('starting', {command: command.pretty})

		eye.on('executing', () => {
			logger.updateState('executing')
		})

		eye.on('changes', (event, path) => {
			logger.updateState('changes', {event, path})
		})

		eye.on('exited', (time, code) => {
			if (code === 0) {
				logger.updateState('success', {time})
			} else {
				logger.updateState('failure', {time, code})
			}
		})
	}
} catch (err) {
	console.log(err)
	process.exit(1)
}
