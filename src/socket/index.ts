import authMiddleware from './authMiddleware'
import usersHandler from './usersHandler'
import ordersHandler from './ordersHandler'
import dountimesHandler from './dountimesHandler'
import scheduleNotesHandler from './scheduleNotesHandler'
import { massUpdateHandler } from './massUpdateHandler'
import { Server, Socket } from 'socket.io'
export const io = new Server({})

export const options = {
  cors: '*',
}
export const emitTo = (to: string, eventType: string, payload: any) => {
  io.to(to).emit(eventType, payload)
}

io.use(authMiddleware)
const onConnection = (socket: Socket) => {
  usersHandler(io, socket)
  //  initDataHandler(io, socket)
  ordersHandler(io, socket)
  dountimesHandler(io, socket)
  scheduleNotesHandler(io, socket)
  massUpdateHandler(io, socket)
}

io.on('connection', onConnection)
