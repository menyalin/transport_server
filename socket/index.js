import authMiddleware from './authMiddleware.js'
import usersHandler from './usersHandler.js'
//  import initDataHandler from './initDataHandler.js'
import ordersHandler from './ordersHandler.js'
import dountimesHandler from './dountimesHandler.js'
import scheduleNotesHandler from './scheduleNotesHandler.js'

import { Server } from 'socket.io'
const io = new Server({})

const options = {
  cors: '*',
}
const emitTo = (to, eventType, payload) => {
  io.to(to).emit(eventType, payload)
}

io.use(authMiddleware)
const onConnection = (socket) => {
  usersHandler(io, socket)
  //  initDataHandler(io, socket)
  ordersHandler(io, socket)
  dountimesHandler(io, socket)
  scheduleNotesHandler(io, socket)
}

io.on('connection', onConnection)

export { io, options, emitTo }
