import { ReportService } from '../services/index.js'

class ReportController {
  constructor({ service }) {
    this.service = service
  }

  async daysControl(req, res) {
    try {
      const data = await this.service.daysControl(
        req.query.daysLimit,
        req.query.profile
      )
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}

export default new ReportController({ service: ReportService })
