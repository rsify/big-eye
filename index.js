/* eslint unicorn/no-process-exit: "off" */

const EventEmitter = require('events')

const chokidar = require('chokidar')
const debounce = require('lodash.debounce')
const execa = require('execa')

module.exports = (command, options = {}) => {
	const defaults = {
		delay: 10,
		ignore: [],
		lazy: false,
		watch: []
	}

	options.delay = options.delay || 10
	options.ignore = options.ignore || []
	options.lazy = options.lazy || false
	options.watch = options.watch || []

	const opts = Object.assign(defaults, options)

	if (typeof command !== 'string') {
		throw new TypeError(`command must be a string, got ${typeof command}`)
	}

	if (command.length === 0) {
		throw new Error('command\'s length must be greater than 0')
	}

	if (typeof opts.delay !== 'number') {
		throw new TypeError(`delay must be a number, got ${typeof opts.delay}`)
	}

	if (typeof opts.ignore !== 'string' && !Array.isArray(opts.ignore)) {
		throw new TypeError(`ignore must be an array or string, got ${typeof opts.ignore}`)
	}

	if (typeof opts.lazy !== 'boolean') {
		throw new TypeError(`lazy must be a boolean, got ${typeof opts.lazy}`)
	}

	if (typeof opts.watch !== 'string' && !Array.isArray(opts.watch)) {
		throw new TypeError(`watch must be an array or string, got ${typeof opts.watch}`)
	}

	if (!Array.isArray(opts.ignore)) {
		opts.ignore = [opts.ignore]
	}

	if (!Array.isArray(opts.watch)) {
		opts.watch = [opts.watch]
	}

	const events = new EventEmitter()

	let ref
	const execute = () => {
		new Promise(resolve => {
			if (ref) {
				ref.kill('SIGTERM')
				ref.on('close', resolve)
			} else {
				resolve()
			}
		}).then(() => {
			ref = execa.shell(command, {
				stdio: 'inherit'
			})

			ref.createdTime = Number(new Date())

			events.emit('executing')

			ref.on('close', (code, signal) => {
				if (code === null) {
					events.emit('killed', signal)
				} else {
					const time = Number(new Date()) - ref.createdTime

					if (code === 0) {
						events.emit('success', time)
					} else {
						events.emit('failure', time, code)
					}
				}

				ref = null
			})
		})
	}

	// Attach watcher
	const watcher = chokidar.watch(opts.watch, {
		ignored: opts.ignore,
		ignoreInitial: true
	})

	const x = debounce(execute, options.delay)

	watcher.on('all', (event, path) => {
		events.emit('changes', event, path)
		x()
	})

	watcher.on('ready', () => events.emit('ready'))

	if (!options.lazy) {
		x()
	}

	return events
}
