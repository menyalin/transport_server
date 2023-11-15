// @ts-nocheck
import { IController } from './iController'
import { AgreementService } from '../services'

class AgreementController extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }

  async getList(req, res) {
    try {
      const data = await this.service.getList(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getForOrder(req, res) {
    try {
      const data = await this.service.getForOrder(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getForClient(req, res) {
    try {
      const data = await this.service.getForClient({
        client: req.query.client,
        company: req.companyId,
        date: new Date(req.query.date),
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new AgreementController({
  service: AgreementService,
  permissionName: 'agreement',
})
