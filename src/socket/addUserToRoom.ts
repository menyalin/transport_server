// @ts-nocheck
import { io } from '.'

export default async (userId, room) => {
  for (const [_, socket] of io.of('/').sockets) {
    if (socket.userId === userId) {
      socket.join(room)
    }
  }
}
