// @ts-nocheck
import { IController } from './iController'
import { DocsRegistryService, PermissionService } from '../services'

class DocsRegistryController extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }

  async deleteById(req, res) {
    try {
      if (this.permissionName)
        await PermissionService.check({
          userId: req.userId,
          companyId: req.companyId,
          operation: this.permissionName + ':delete',
        })
      const data = await this.service.deleteById({
        id: req.params.id,
        user: req.userId,
        company: req.companyId,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
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

  async pickOrders(req, res) {
    try {
      const data = await this.service.pickOrdersForRegistry({
        docsRegistryId: req.query.docsRegistryId,
        company: req.companyId,
        ...req.query,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async addOrdersToRegistry(req, res) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':write',
      })

      const data = await this.service.addOrdersToRegistry({
        docsRegistryId: req.body.docsRegistryId,
        orders: req.body.orders,
        company: req.companyId,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async removeOrdersFromRegistry(req, res) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':write',
      })

      const data = await this.service.removeOrdersFromRegistry({
        docsRegistryId: req.body.docsRegistryId,
        orders: req.body.orders,
        company: req.companyId,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new DocsRegistryController({
  service: DocsRegistryService,
  permissionName: 'docsRegistry',
})
