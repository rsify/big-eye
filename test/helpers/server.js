import EventEmitter from 'events'
import path from 'path'
import net from 'net'

import getPort from 'get-port'

import bigEye from '../..'

const countConnections = server => () => {
	return new Promise((resolve, reject) => {
		server.getConnections((err, count) => {
			if (err) {
				reject(err)
			} else {
				resolve(count)
			}
		})
	})
}

export default async (eyeOpts = {}) => {
	const port = await getPort()
	const sockets = new Set()

	const childPath = path.resolve(__dirname, '../fixtures/child.js')
	const eye = bigEye(`node ${childPath} ${port}`, eyeOpts)

	const server = net.createServer().listen(port)
	const events = new EventEmitter()

	let execCount = 0
	server.on('connection', sock => {
		sockets.add(sock)
		events.emit('executed')
		execCount++
		sock.on('close', () => {
			sockets.delete(sock)
		})
	})

	return {
		events,
		server,
		eye,
		stat: {
			get sockets() {
				return sockets
			},
			get execCount() {
				return execCount
			},
			connectionCount: countConnections(server)
		}
	}
}
