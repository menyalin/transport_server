import { OrderService as service } from '../services/index.js'

export default async (io, socket) => {
  socket.on('moveOrderInSchedule', (order) =>
    service.moveOrderInSchedule(order, socket.userId)
  )
  socket.on('disableOrder', service.disableOrder)
}
