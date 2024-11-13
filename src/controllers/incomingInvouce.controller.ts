import { IncomingInvoiceService, PermissionService } from '@/services'
import { AuthorizedRequest } from './interfaces'
import { Response } from 'express'
import { BadRequestError } from '@/helpers/errors'

interface IConstructorProps {
  service: typeof IncomingInvoiceService
  permissionService: typeof PermissionService
}

class IncomingInvoiceController {
  service: typeof IncomingInvoiceService
  permissionService: typeof PermissionService
  permissionName = 'incoming_invoice'

  constructor({ service, permissionService }: IConstructorProps) {
    this.permissionService = permissionService
    this.service = service
  }

  async pickOrders(req: AuthorizedRequest, res: Response) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':readItem',
      })
      const data = await this.service.pickOrders(req.query)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getList(req: AuthorizedRequest, res: Response) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':readList',
      })
      const data = await this.service.getList(req.query)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getById(req: AuthorizedRequest, res: Response) {
    try {
      const data = await this.service.getById(req.params.id)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async create(req: AuthorizedRequest, res: Response) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':write',
      })
      const data = await this.service.create(req.body)
      res.status(201).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
  async updateOne(req: AuthorizedRequest, res: Response) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':write',
      })
      const data = await this.service.updateOne(req.params.id, req.body)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async deleteById(req: AuthorizedRequest, res: Response) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':delete',
      })
      const result: boolean = await this.service.deleteById(
        req.params.id,
        req.companyId
      )
      res.status(200).json({ message: result ? 'ok' : 'not found' })
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async addOrdersToInvoice(req: AuthorizedRequest, res: Response) {
    try {
      if (!req.companyId || req.companyId !== req.body?.company)
        throw new BadRequestError('CompanyId mismatch')

      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':write',
      })
      const data = await this.service.addOrdersToInvoice(
        req.params.id,
        req.body.orders
      )
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async deleteOrderFromInvoice(req: AuthorizedRequest, res: Response) {}

  async updateOrderInInvoice(req: AuthorizedRequest, res: Response) {}
}

export default new IncomingInvoiceController({
  service: IncomingInvoiceService,
  permissionService: PermissionService,
})
