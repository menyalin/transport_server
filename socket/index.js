const authMiddleware = require('./authMiddleware')
const usersHandler = require('./usersHandler')

const io = require('socket.io')({
  serveClient: true
})

io.use(authMiddleware)
const onConnection = (socket) => {
  usersHandler(io, socket)
}

io.on('connection', onConnection)

module.exports = {
  io,
  options: {
    cors: ['http://localhost:8080']
  }
}
