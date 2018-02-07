const fs = require('fs')
const os = require('os')

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

const flagsToOptions = flags => {
	const options = {}

	if (flags.watch) {
		options.watch = mergeToArr(flags.w, flags.watch)
	} else {
		options.watch = ['.']
	}

	if (flags.ignore) {
		options.ignore = mergeToArr(flags.i, flags.ignore)
	} else if (fs.existsSync('.gitignore')) {
		const content = fs.readFileSync('.gitignore', 'utf8')
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
