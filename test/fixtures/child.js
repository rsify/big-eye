const net = require('net')

const port = process.argv[2]

const socket = net.connect(port)
