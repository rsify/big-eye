const net = require('net')

const port = process.argv[2]

// Exit immediately
net.connect(port, process.exit)
