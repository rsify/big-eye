'use strict'

/* eslint unicorn/no-process-exit: "off" */

const EventEmitter = require('events')

const chokidar = require('chokidar')
const debounce = require('lodash.debounce')
const execa = require('execa')

const defaults = {
	delay: 10,
	ignore: [],
	lazy: false,
	watch: []
}

// String, Array, Object
// file, [args], [options]
module.exports = (file, args, options) => {
	// (file)
	if (typeof args === 'undefined' && typeof options === 'undefined') {
		options = {}
		args = []
	}

	// ('file', {})
	if (typeof options === 'undefined' && !Array.isArray(args)) {
		options = args
		args = []
	}

	// ('file', [])
	if (typeof options === 'undefined' && Array.isArray(args)) {
		options = {}
	}

	const opts = Object.assign({}, defaults, options)

	if (typeof file !== 'string') {
		throw new TypeError(`file must be a string, got ${typeof file}`)
	}

	if (file.length === 0) {
		throw new Error('file\'s length must be greater than 0')
	}

	if (!Array.isArray(args)) {
		throw new TypeError(`args must be an array, got ${typeof args}`)
	}

	if (typeof opts.delay !== 'number') {
		throw new TypeError(`opts.delay must be a number, got ${typeof opts.delay}`)
	}

	if (typeof opts.ignore !== 'string' && !Array.isArray(opts.ignore)) {
		throw new TypeError(`opts.ignore must be an array or string, got ${typeof opts.ignore}`)
	}

	if (typeof opts.lazy !== 'boolean') {
		throw new TypeError(`opts.lazy must be a boolean, got ${typeof opts.lazy}`)
	}

	if (typeof opts.watch !== 'string' && !Array.isArray(opts.watch)) {
		throw new TypeError(`opts.watch must be an array or string, got ${typeof opts.watch}`)
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
			ref = execa(file, args, {
				stdio: 'inherit'
			})

			ref.createdTime = Number(new Date())

			events.emit('executing', ref)

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
