'use strict'
/* istanbul ignore file */

const chalk = require('chalk')
const cliCursor = require('cli-cursor')
const escapes = require('ansi-escapes')
const figures = require('figures')
const pad = require('lodash.pad')
const padStart = require('lodash.padstart')
const prettyMs = require('pretty-ms')

class Logger {
	constructor(stream, options) {
		this.stream = stream
		this.options = options

		this.childStream = null
		this.state = null
		this.clearOutput = false
	}

	// States: starting, executing, changes, success, fail, error
	updateState(state, data) {
		const oldState = this.state

		let out = ''
		let prependNewLine = true

		if (this.clearOutput) {
			this.stream.write(escapes.eraseLines(3))
			this.clearOutput = false
		}

		if (state === 'starting') {
			out = chalk.blue(figures.info) +
				` Starting ${chalk.bold('big-eye')}` +
				` ${chalk.grey(`(${data.command})`)}`

			this.clearOutput = false
			cliCursor.hide()
		} else if (state === 'executing') {
			const date = new Date()
			const h = padStart(date.getHours(), 2, 0)
			const m = padStart(date.getMinutes(), 2, 0)
			const s = padStart(date.getSeconds(), 2, 0)
			const dateString = `[${h}:${m}:${s}]`

			const separator = pad(dateString, this.stream.columns, '─')
			this.stream.write('\n' + chalk.gray.dim(separator) + '\n')

			this.clearOutput = false
			cliCursor.show()
		} else if (state === 'success') {
			out = `${chalk.green(figures.info + ' Success!')}` +
				` ${chalk.gray(`(${prettyMs(data.time)})`)}`

			cliCursor.hide()
		} else if (state === 'failure') {
			out = `${chalk.red(`${figures.cross} Failure:` +
				` exit code ${chalk.bold(data.code)}`)}` +
				` ${chalk.gray(`(${prettyMs(data.time)})`)}`

			cliCursor.hide()
		} else if (state === 'changes') {
			out = chalk.blue(figures.info) +
				' Changes detected, restarting...' +
				` ${chalk.gray(`(${data.event} ${data.path})`)}`

			if (oldState !== 'executing') {
				prependNewLine = false
			}
		} else if (state === 'error') {
			out = chalk.red(`${figures.cross} ${data.msg}`)
		}

		if (out) {
			this.stream.write((prependNewLine ? '\n' : '') + '  ' + out + '\n')
		}

		this.state = state
	}
}

module.exports = Logger
