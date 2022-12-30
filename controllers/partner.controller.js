import { IController } from './iController.js'
import { PartnerService, PermissionService } from '../services/index.js'

class PartnerController extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }

  async addPlaceForTransferDocs(req, res) {
    try {
      if (this.permissionName)
        await PermissionService.check({
          userId: req.userId,
          companyId: req.companyId,
          operation: this.permissionName + ':write',
        })
      const data = await this.service.addPlaceForTransferDocs(
        req.partnerId,
        req.body,
        req.userId
      )
      res.status(201).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new PartnerController({
  service: PartnerService,
  permissionName: 'partner',
})
