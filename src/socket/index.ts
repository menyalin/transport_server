// @ts-nocheck
import authMiddleware from './authMiddleware'
import usersHandler from './usersHandler'
//  import initDataHandler from './initDataHandler'
import ordersHandler from './ordersHandler'
import dountimesHandler from './dountimesHandler'
import scheduleNotesHandler from './scheduleNotesHandler'

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
