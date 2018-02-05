// Using a server because you can not only check when it executed
// But also if it is still running

// Spawn a server
// Create a port with get-port
// Command: node fixtures/child.js port
// Watch (struc)

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

	const childPath = path.resolve(__dirname, '../fixtures/child.js')
	const eye = bigEye(`node ${childPath} ${port}`, eyeOpts)

	const server = net.createServer().listen(port)
	const events = new EventEmitter()

	let execCount = 0
	server.on('connection', () => {
		events.emit('executed')
		execCount++
	})

	return {
		events,
		server,
		eye,
		stat: {
			get execCount() {
				return execCount
			},
			connectionCount: countConnections(server)
		}
	}
}
