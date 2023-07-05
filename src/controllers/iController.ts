// @ts-nocheck
import { PermissionService } from '../services/index.js'

export class IController {
  constructor({ service, permissionName }) {
    this.service = service
    this.permissionName = permissionName
    this.PermissionService = PermissionService
  }

  async create(req, res) {
    try {
      if (this.permissionName)
        await PermissionService.check({
          userId: req.userId,
          companyId: req.companyId,
          operation: this.permissionName + ':write',
        })
      const data = await this.service.create({
        body: req.body,
        user: req.userId,
        company: req.companyId,
      })
      res.status(201).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async updateOne(req, res) {
    try {
      if (this.permissionName)
        await PermissionService.check({
          userId: req.userId,
          companyId: req.companyId,
          operation: this.permissionName + ':write',
        })
      const data = await this.service.updateOne({
        id: req.params.id,
        body: req.body,
        user: req.userId,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getByProfile(req, res) {
    try {
      const data = await this.service.getByProfile(req.query.profile)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getById(req, res) {
    try {
      const data = await this.service.getById(req.params.id)
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
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
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}
