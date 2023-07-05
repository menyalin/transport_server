// @ts-nocheck
import { io } from './index.js'

export default async (userId, room) => {
  // eslint-disable-next-line no-unused-vars
  for (const [_, socket] of io.of('/').sockets) {
    if (socket.userId === userId) {
      socket.join(room)
    }
  }
}
