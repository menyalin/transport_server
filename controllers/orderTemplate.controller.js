import { IController } from './iController.js'
import { OrderTemplateService } from '../services/index.js'

class OrderTemplateController extends IController {
  constructor({ service }) {
    super({ service })
    this.service = service
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

export default new OrderTemplateController({ service: OrderTemplateService })
