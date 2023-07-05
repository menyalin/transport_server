// @ts-nocheck
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
        req.params.partnerId,
        req.body,
        req.userId
      )
      res.status(201).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async updatePlaceForTransferDocs(req, res) {
    try {
      if (this.permissionName)
        await PermissionService.check({
          userId: req.userId,
          companyId: req.companyId,
          operation: this.permissionName + ':write',
        })
      const data = await this.service.updatePlaceForTransferDocs(
        req.params.partnerId,
        req.params.placeId,
        req.body,
        req.userId
      )
      res.status(201).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async deletePlaceForTransferDocs(req, res) {
    try {
      if (this.permissionName)
        await PermissionService.check({
          userId: req.userId,
          companyId: req.companyId,
          operation: this.permissionName + ':write',
        })
      const data = await this.service.deletePlaceForTransferDocs(
        req.params.partnerId,
        req.params.placeId,
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
