import { IController } from './iController.js'
import { DowntimeService } from '../services/index.js'

class DowntimeController extends IController {
  constructor({ service }) {
    super({ service })
    this.service = service
  }

  async getListForSchedule(req, res) {
    try {
      const data = await this.service.getListForSchedule(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }

  async getList(req, res) {
    try {
      const data = await this.service.getList(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}

export default new DowntimeController({ service: DowntimeService })
