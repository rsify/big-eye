const net = require('net')

if (typeof process.argv[2] !== 'undefined') {
	const port = process.argv[2]
	const socket = net.connect(port)

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
} else {
	process.stdin.resume()
}

