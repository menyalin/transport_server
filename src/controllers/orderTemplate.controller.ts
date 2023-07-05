// @ts-nocheck
import { IController } from './iController.js'
import { OrderTemplateService } from '../services/index.js'

class OrderTemplateController extends IController {
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
}

export default new OrderTemplateController({ service: OrderTemplateService, permissionName: 'orderTemplate' })
