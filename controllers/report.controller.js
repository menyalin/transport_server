import { ReportService } from '../services/index.js'

class ReportController {
  constructor({ service }) {
    this.service = service
  }

  async daysControl(req, res) {
    try {
      const data = await this.service.daysControl(
        req.query.days,
        req.query.profile,
      )
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async inProgressOrders(req, res) {
    try {
      const data = await this.service.inProgressOrders({
        profile: req.query.profile,
        client: req.query.client,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async truckStateOnDate(req, res) {
    try {
      const data = await this.service.truckStateOnDate({
        company: req.query.company,
        date: req.query.date,
        truckType: req.query.truckType,
        tkName: req.query.tkName,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async driversGradesGetLink(req, res) {
    try {
      const data = await this.service.driversGradesGetLink({
        company: req.body.company,
        dateRange: req.body.dateRange,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new ReportController({ service: ReportService })
