#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2))
const bigEye = require('./')
const logger = require('./lib/logger')
const pkg = require('./package.json')

const HELP =
`usage: ${pkg.name} command [-w/--watch file/dir] [-i/--ignore file/dir] [-q/--quiet]

    options:
        -w, --watch (default: current dir): Specifies files/dirs to
            be watched. If a dir is provided it is watched recursively, unless
			it's the pwd.
			Can be used multiple times.

        -i, --ignore (default: .git, node_modules): Specifies files/dirs to
            be ignored, even when specified by the --watch option.
            Can be used multiple times.

        -q, --quiet (default: false): pipe only command outputs to stdout
`

if (argv.h || argv.help) {
	console.log(HELP)
	process.exit()
}

const mergeToArr = (x, y) => {
	if (typeof x === 'undefined') x = []
	if (typeof y === 'undefined') y = []

	if (!Array.isArray(x)) x = [ x ]
	if (!Array.isArray(y)) y = [ y ]

	const tmp = x.concat(y)
	return tmp.length ? tmp : null
}

const obj = {}

const watch = mergeToArr(argv.w, argv.watch)
if (watch) obj.watch = watch

const command = (function () {
	let res = argv.x || argv.execute || argv._
	if (Array.isArray(res)) return res.join(' ')
	else return res
})()
if (command) obj.command = command

const ignore = mergeToArr(argv.i, argv.ignore)
if (ignore) obj.ignore = ignore

const verbose = (function () {
	if (argv.silent === false || argv.q === false) return false
	else return true
})()
if (verbose) obj.verbose = verbose

try {
	bigEye(obj)
} catch (e) {
	logger('error', e.stack)
	process.exit(1)
}
