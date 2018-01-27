const fs = require('fs')
const net = require('net')
const path = require('path')

const getPort = require('get-port')
const test = require('ava')

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

test.cb('runs command on change', t => {
	if (!fs.existsSync(path.resolve(__dirname, 'tmp')))	{
		fs.mkdirSync(path.resolve(__dirname, 'tmp'))
	}

	cleanup()

	const testMsg = 'ran exactly three times'
	getPort().then(port => {
		const eye = bigEye({
			watch: path.resolve(__dirname, 'tmp'),
			command: `node ${path.resolve(__dirname, 'fixtures/child.js')} ${port}`,
			verbose: false
		})

		setTimeout(() => {
			touch(path.resolve(__dirname, 'tmp', 'in-1'))
		}, 500)

		setTimeout(() => {
			touch(path.resolve(__dirname, 'tmp', 'in-2'))
		}, 1000)

		let restarts = 0

		const server = net.createServer().listen({port})

		server.on('connection', () => restarts++)

		setTimeout(() => {
			t.is(restarts, 3, testMsg)
			cleanup()
			server.unref()
			eye.stop()
			t.end()
		}, 1500)
	}).catch(() => {
		t.fail(testMsg)
		cleanup()
		t.end()
	})
})
