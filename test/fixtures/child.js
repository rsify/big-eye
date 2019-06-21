/* eslint-disable unicorn/no-process-exit */

const net = require('net')

if (typeof process.argv[2] === 'undefined') {
	process.stdin.resume()
} else {
	const port = process.argv[2]
	const socket = net.connect(port, '127.0.0.1')

	socket.on('data', buffer => {
		const data = buffer.toString()
		if (data.indexOf('exit') === 0) {
			const arr = data.split(' ')

			if (arr.length === 2) {
				process.exit(arr[1])
			} else {
				process.exit()
			}
		}
	})

	socket.on('error', () => {})
}

