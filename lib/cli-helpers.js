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

	return x.concat(y)
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

	if (typeof flags.delay !== 'undefined') {
		options.delay = flags.delay
	}

	return options
}

const parseCommand = (cwd, cmd) => {
	const which = npmWhich(cwd)

	const arr = cmd.split(' ')
	let file = null
	if (arr[0]) {
		if (fs.existsSync(path.join(cwd, arr[0]))) {
			const filePath = path.join(cwd, arr[0])

			if (path.parse(filePath).ext === '.js') {
				file = which.sync('node')
			} else if (executable.sync(filePath)) {
				file = filePath
			} else {
				throw new Error(`${arr[0]} is not executable`)
			}
		} else {
			try {
				// Search for executable file in npm enhanced PATH
				file = which.sync(arr[0])
			} catch (err) {
				throw new Error(`${arr[0]} does not exist`)
			}
		}
	} else if (fs.existsSync(path.join(cwd, 'package.json'))) {
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
			throw new Error('no command specified' +
				` & missing package.json start script (${err})`)
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
