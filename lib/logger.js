const chalk = require('chalk')
const pkg = require('../package.json')

const COLORS = {
	'success': 'green',
	'info': 'cyan',
	'error': 'red',
	'warn': 'yellow'
}

module.exports = (level, msg) => {
	const color = chalk[COLORS[level]]

	console.log(chalk.bold(color(pkg.name), chalk.gray(msg)))
}

