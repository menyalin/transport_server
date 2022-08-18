import { IController } from './iController.js'
import { WorkerService } from '../services/index.js'

class WorkerController extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }

  async getUserByEmail(req, res) {
    try {
      if (this.permissionName)
        await this.PermissionService.check({
          userId: req.userId,
          companyId: req.companyId,
          operation: this.permissionName + ':userAdmin',
        })
      const data = await this.service.getUserByEmail({
        email: req.query.email,
        companyId: req.companyId,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async acceptInvite(req, res) {
    try {
      const data = await this.service.acceptInvite({
        userId: req.userId,
        workerId: req.params.workerId,
        accepted: req.body.accepted,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async addUser(req, res) {
    try {
      if (this.permissionName)
        await this.PermissionService.check({
          userId: req.userId,
          companyId: req.companyId,
          operation: this.permissionName + ':write',
        })
      const data = await this.service.addUser({
        workerId: req.params.id,
        userId: req.body.user,
        roles: req.body.roles,
        actor: req.userId,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new WorkerController({
  service: WorkerService,
  permissionName: 'worker',
})
