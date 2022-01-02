import { OrderService as service } from '../services/index.js'

export default async (io, socket) => {
  socket.on('moveOrderInSchedule', (order) =>
    service.moveOrderInSchedule(order, socket.userId)
  )

  socket.on('disableOrder', service.disableOrder)

  socket.on('ordersForSchedule', async ({ profile, startDate, endDate }) => {
    const orders = await service.getListForSchedule({
      profile,
      startDate,
      endDate
    })
    socket.emit('ordersForSchedule', orders)
  })
}
