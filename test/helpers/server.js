import EventEmitter from 'events'
import net from 'net'

import getPort from 'get-port'

import makeEye from './make-eye'

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

	const eye = makeEye(eyeOpts, port)

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
			get firstSocket() {
				return sockets.values().next().value
			},
			get execCount() {
				return execCount
			},
			connectionCount: countConnections(server)
		}
	}
}
