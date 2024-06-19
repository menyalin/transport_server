// @ts-nocheck
import { ScheduleNoteService as service } from '../services'

export default async (_io, socket) => {
  socket.on('notesForSchedule', async ({ company, startDate, endDate }) => {
    const res = await service.getListForSchedule({
      company,
      startDate,
      endDate,
    })
    socket.emit('notesForSchedule', res)
  })
}
