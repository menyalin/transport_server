import { Response } from 'express'
import { CarrierAgreementService, PermissionService } from '@/services'
import { AuthorizedRequest } from './interfaces'
import { BadRequestError } from '@/helpers/errors'

interface IProps {
  service: typeof CarrierAgreementService
  permissionService: typeof PermissionService
  permissionName: string
}

class CarrierAgreementController {
  service: typeof CarrierAgreementService
  permissionService: typeof PermissionService
  permissionName: string

  constructor({ service, permissionName, permissionService }: IProps) {
    this.permissionService = permissionService
    this.permissionName = permissionName
    this.service = service
  }

  async create(req: AuthorizedRequest, res: Response) {
    try {
      if (!req.companyId) throw new BadRequestError('Missing companyId')

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

  async update(req: AuthorizedRequest, res: Response) {
    try {
      if (!req.companyId) throw new BadRequestError('Missing companyId')
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':write',
      })
      const data = await this.service.update(req.params.id, req.body)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getById(req: AuthorizedRequest, res: Response) {
    try {
      const data = await this.service.getById(req.params?.id)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getAllowedAgreements(req: AuthorizedRequest, res: Response) {
    try {
      const data = await this.service.getAllowedAgreements(req.query)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getList(req: AuthorizedRequest, res: Response) {
    try {
      if (!req.companyId) throw new BadRequestError('Missing companyId')
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

  async deleteById(req: AuthorizedRequest, res: Response) {
    try {
      if (!req.companyId) throw new BadRequestError('Missing companyId')
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':delete',
      })
      const data = await this.service.deleteById(req.params.id)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
}

export default new CarrierAgreementController({
  service: CarrierAgreementService,
  permissionService: PermissionService,
  permissionName: 'carrierAgreement',
})
