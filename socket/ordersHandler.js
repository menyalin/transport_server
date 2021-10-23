import { OrderService as service } from '../services/index.js'

export default async (io, socket) => {
  socket.on('moveOrderInSchedule', service.moveOrderInSchedule)
}
