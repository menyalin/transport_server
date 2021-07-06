import authMiddleware from './authMiddleware.js'
import usersHandler from './usersHandler.js'
import initDataHandler from './initDataHandler.js'

import { Server } from 'socket.io'
const io = new Server({})

const options = {
  cors: {
    origin: true
  }
}
const emitTo = (to, eventType, payload) => {
  io.to(to).emit(eventType, payload)
}

io.use(authMiddleware)
const onConnection = (socket) => {
  usersHandler(io, socket)
  initDataHandler(io, socket)
}

io.on('connection', onConnection)

export { io, options, emitTo }
