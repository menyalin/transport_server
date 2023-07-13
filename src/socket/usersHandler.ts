// @ts-nocheck
import { UserService } from '../services'

const _updateUserList = async (io, socket, room) => {
  const sockets = []
  for (const [id, socket] of io.of('/').sockets) {
    sockets.push({
      socketId: id,
      userId: socket.userId,
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

const _setUserRooms = async (socket) => {
  if (!socket?.userId) return null
  socket.join(socket.userId)
  const user = await UserService.findById(socket.userId)
  if (user && user.directoriesProfile)
    socket.join(user.directoriesProfile.toString())
}

export default (io, socket) => {
  _setUserRooms(socket)
  _updateUserList(io)

  socket.on('getActiveUsers', () => {
    _updateUserList(io, socket, socket.id)
  })

  socket.on('disconnect', () => {
    _updateUserList(io)
  })
}
