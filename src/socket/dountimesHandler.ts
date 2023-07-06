// @ts-nocheck
import { DowntimeService as service } from '../services'

export default async (io, socket) => {
  socket.on('downtimesForSchedule', async ({ company, startDate, endDate }) => {
    const res = await service.getListForSchedule({
      company,
      startDate,
      endDate,
    })
    socket.emit('downtimesForSchedule', res)
  })
}
