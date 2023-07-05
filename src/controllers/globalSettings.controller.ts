// @ts-nocheck
import {
  PermissionService,
  GlobalSettingsService as service,
} from '../services/index.js'

class GlobalSettingsController {
  async create(req, res) {
    try {
      await PermissionService.adminCheck(req.userId)
      const data = await service.create(req.body)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new GlobalSettingsController()
