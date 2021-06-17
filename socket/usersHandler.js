const UserService = require('../services/user')

const _updateUserList = async (io, socket, room) => {
  const sockets = []
  for (const [id, socket] of io.of('/').sockets) {
    sockets.push({
      socketId: id,
      userId: socket.userId
    })
  }
  const userIds = sockets.map((item) => item.userId)
  const tmpUsers = await UserService.find({ _id: userIds })
  const users = []
  for (let i = 0; i < sockets.length; i++) {
    users.push({
      ...sockets[i],
      user: tmpUsers.find((item) => item._id.toString() === sockets[i].userId)
    })
  }
  if (!!socket && !!room) io.to(room).emit('activeUsers', users)
  else io.emit('activeUsers', users)
}

const _addSocketRooms = (socket) => {
  socket.join(socket.userId) // userId room
}

module.exports = (io, socket) => {
  _addSocketRooms(socket)
  _updateUserList(io)

  socket.on('getActiveUsers', () => {
    _updateUserList(io, socket, socket.id)
  })

  socket.on('disconnect', () => {
    _updateUserList(io)
  })
}
