// @ts-nocheck
import { IController } from './iController'
import { ScheduleNoteService } from '../services'

class ScheduleNoteController extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }

  async getListForSchedule(req, res) {
    try {
      const data = await this.service.getListForSchedule(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getList(req, res) {
    try {
      const data = await this.service.getList(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new ScheduleNoteController({
  service: ScheduleNoteService,
  permissionName: 'scheduleNote',
})
