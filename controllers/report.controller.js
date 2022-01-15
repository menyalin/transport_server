import { ReportService } from '../services/index.js'

class ReportController {
  constructor({ service }) {
    this.service = service
  }

  async daysControl(req, res) {
    try {
      const data = await this.service.daysControl(
        req.query.days,
        req.query.profile
      )
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }

  async inProgressOrders(req, res) {
    try {
      const data = await this.service.inProgressOrders({
        profile: req.query.profile,
        client: req.query.client
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}

export default new ReportController({ service: ReportService })
