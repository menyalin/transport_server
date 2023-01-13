import { IController } from './iController.js'
import { DocsRegistryService, PermissionService } from '../services/index.js'

class FineController extends IController {
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

  async pickOrders(req, res) {
    try {
      const data = await this.service.pickOrders({
        company: req.company,
        ...req.query,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new FineController({
  service: DocsRegistryService,
  permissionName: 'docsRegistry',
})
