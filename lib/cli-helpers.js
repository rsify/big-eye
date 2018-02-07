const fs = require('fs')
const os = require('os')
const path = require('path')

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

module.exports = {flagsToOptions, mergeToArr}
