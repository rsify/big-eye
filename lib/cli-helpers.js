'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')

const npmWhich = require('npm-which')
const executable = require('executable')

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

	const s = new Set(x.concat(y))

	return Array.from(s)
}

const flagsToOptions = (cwd, flags) => {
	const options = {}

	if (flags.watch) {
		options.watch = mergeToArr(flags.w, flags.watch)
	} else {
		options.watch = ['.']
	}

	const gitIgnorePath = path.join(cwd, '.gitignore')
	if (flags.ignore) {
		options.ignore = mergeToArr(flags.i, flags.ignore)
	} else if (fs.existsSync(gitIgnorePath)) {
		const content = fs.readFileSync(gitIgnorePath, 'utf8')
		options.ignore = content.split(os.EOL).filter(x => x.length !== 0)
	} else {
		options.ignore = []
	}

	if (typeof flags.lazy !== 'undefined') {
		options.lazy = flags.lazy
	}

	if (typeof flags.delay !== 'undefined' && !isNaN(parseInt(flags.delay, 10))) {
		options.delay = parseInt(flags.delay, 10)
	}

	return options
}

// 'cmd' precedence:
// if provided:
//   local .js > local executable > node_modules executable > PATH executable
// else:
//   parseCommand(npm start script)
const parseCommand = (cwd, cmd) => {
	const which = npmWhich(cwd)

	const arr = cmd.split(' ')
	let file = null
	if (arr[0]) {
		const filePath = path.join(cwd, arr[0])
		const exists = fs.existsSync(filePath)
		const isFile = exists ? fs.statSync(filePath).isFile() : false

		if (isFile && path.parse(filePath).ext === '.js') {
			// Local .js
			file = which.sync('node')
			arr.unshift('node')
		} else if (exists && executable.sync(filePath)) {
			// Local executable
			file = filePath
		} else {
			try {
				// 'node_modules' executable + PATH executable
				file = which.sync(arr[0])
			} catch (err) {
				throw new Error(`${arr[0]} is not executable`)
			}
		}
	} else if (fs.existsSync(path.join(cwd, 'package.json'))) {
		// 'npm start script'
		const pkgContents = fs.readFileSync(
			path.join(cwd, 'package.json'), 'utf8'
		)

		try {
			const pkgObj = JSON.parse(pkgContents)

			if (typeof pkgObj.scripts === 'undefined' ||
				typeof pkgObj.scripts.start === 'undefined' ||
				pkgObj.scripts.start.length === 0) {
				throw new Error('missing package.json start script')
			}

			return parseCommand(cwd, pkgObj.scripts.start)
		} catch (err) {
			throw new Error(`no command specified (${err.message})`)
		}
	} else {
		throw new Error('no command specified')
	}

	const args = arr.slice(1)

	return {file, args}
}

module.exports = {
	flagsToOptions,
	mergeToArr,
	parseCommand
}
