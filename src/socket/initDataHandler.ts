// @ts-nocheck
import { TaskService } from '../services/index.js'

export default async (io, socket) => {
  const tasks = await TaskService.getActiveTasksForUser(socket.userId)
  io.to(socket.id).emit('tasks:getAllActive', tasks)
}
