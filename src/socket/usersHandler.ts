import { UserService } from '../services'
import { Socket, Server } from 'socket.io'

const _updateUserList = async (io: Server) => {
  const sockets: { socketId: string; userId: string }[] = []
  for (const [id, socket] of io.of('/').sockets) {
    sockets.push({
      socketId: id,
      userId: socket.handshake.auth.userId,
    })
  }

  const userIds = sockets.map((item) => item.userId)
  const tmpUsers = await UserService.find({ _id: userIds })
  const users = []
  for (let i = 0; i < sockets.length; i++) {
    users.push({
      ...sockets[i],
      user: tmpUsers.find((item) => item._id.toString() === sockets[i].userId),
    })
  }
  io.emit('activeUsers', users)
}

const _setUserRooms = async (socket: Socket) => {
  if (!socket.handshake.auth.userId) return null
  socket.join(socket.handshake.auth.userId)
  const user = await UserService.findById(socket.handshake.auth.userId)
  if (user?.isAdmin) socket.join('admin_room')
  if (user && user.directoriesProfile)
    socket.join(user.directoriesProfile.toString())
}

export default (io: Server, socket: Socket) => {
  _setUserRooms(socket)
  _updateUserList(io)

  socket.on('getActiveUsers', () => {
    _updateUserList(io)
  })

  socket.on('disconnect', () => {
    _updateUserList(io)
  })
}
