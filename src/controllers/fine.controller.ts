import { IController } from './iController.js'
import { FineService, PermissionService } from '../services/index.js'

class FineController extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }

  async getByNumber(req, res) {
    try {
      const data = await this.service.getByNumber(
        req.params.number,
        req.companyId
      )
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
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
}

export default new FineController({
  service: FineService,
  permissionName: 'fine',
})
