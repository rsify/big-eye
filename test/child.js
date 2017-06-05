const net = require('net')

const port = process.argv[2]

// exit immediately
net.connect(port, process.exit)
