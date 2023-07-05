// @ts-nocheck
import { ScheduleNoteService as service } from '../services/index.js'

export default async (io, socket) => {
  socket.on('notesForSchedule', async ({ company, startDate, endDate }) => {
    const res = await service.getListForSchedule({
      company,
      startDate,
      endDate
    })
    socket.emit('notesForSchedule', res)
  })
}
