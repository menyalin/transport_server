import { IController } from './iController.js'
import { TariffService, PermissionService } from '../services/index.js'

class Tariff extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }

  async getList(req, res) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':readList',
      })
      const data = await this.service.getList(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getOrderPrePrice(req, res) {
    try {
      // POST-method
      const data = await this.service.getPrePricesByOrderData(req.body)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new Tariff({
  service: TariffService,
  permissionName: 'tariff',
})
