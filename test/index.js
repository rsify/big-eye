const fs = require('fs')
const net = require('net')
const path = require('path')

const getPort = require('get-port')
const test = require('tape')

const bigEye = require('../')

const touch = filePath => {
	fs.closeSync(fs.openSync(filePath, 'w'))
}

const cleanup = () => {
	const files = fs.readdirSync(path.resolve(__dirname, 'tmp'))

	for (const file of files) {
		const filePath = path.resolve(__dirname, 'tmp', file)
		fs.unlinkSync(filePath)
	}
}

test('runs command on change', {timeout: 1500}, t => {
	t.plan(1)

	if (!fs.existsSync(path.resolve(__dirname, 'tmp')))	{
		fs.mkdirSync(path.resolve(__dirname, 'tmp'))
	}

	cleanup()

	getPort().then(port => {
		const eye = bigEye({
			watch: path.resolve(__dirname, 'tmp'),
			command: `node ${path.resolve(__dirname, 'child.js')} ${port}`,
			verbose: false
		})

		touch(path.resolve(__dirname, 'tmp', 'in-1'))

		setTimeout(() => {
			touch(path.resolve(__dirname, 'tmp', 'in-2'))
		}, 500)

		let restarts = 0

		const server = net.createServer().listen({port})

		server.on('connection', () => restarts++)

		setTimeout(() => {
			t.equal(restarts, 3, 'child ran exactly three times')
			cleanup()
			server.unref()
			eye.stop()
		}, 1000)
	}).catch(() => {
		t.fail('ran exactly three times')
		cleanup()
	})
})
