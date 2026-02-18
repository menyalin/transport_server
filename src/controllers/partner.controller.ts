import { Request, Response } from 'express'
import { IController } from './iController'
import { PartnerService, PermissionService } from '../services'
import { AuthorizedRequest } from '@/controllers/interfaces'
import { BadRequestError } from '../helpers/errors'
import { IdleTruckNotification } from '../domain/partner/idleTruckNotification'
import { Partner as PartnerDomain } from '../domain/partner/partner.domain'

interface IConstructorProps {
  service: typeof PartnerService
  permissionName: string
}

class PartnerController extends IController {
  service: typeof PartnerService
  permissionName: string
  constructor({ service, permissionName }: IConstructorProps) {
    super({ service, permissionName })
    this.service = service
    this.permissionName = permissionName
  }

  validateReq(req: Request): Boolean {
    if (
      'userId' in req &&
      !!req.userId &&
      'companyId' in req &&
      !!req.companyId
    )
      return true
    throw new BadRequestError(
      'PartnerController : userId or companyId is missing'
    )
  }

  async addPlaceForTransferDocs(req: AuthorizedRequest, res: Response) {
    try {
      this.validateReq(req)

      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId as string,
        operation: this.permissionName + ':write',
      })
      const data = await this.service.addPlaceForTransferDocs(
        req.params.partnerId,
        req.body,
        req.userId
      )
      res.status(201).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async updatePlaceForTransferDocs(req: AuthorizedRequest, res: Response) {
    try {
      // this.validateReq(req)

      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId as string,
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
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async deletePlaceForTransferDocs(req: AuthorizedRequest, res: Response) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId as string,
        operation: this.permissionName + ':write',
      })
      const data = await this.service.deletePlaceForTransferDocs(
        req.params.partnerId,
        req.params.placeId,
        req.userId
      )
      res.status(201).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async addIdleTruckNotify(req: AuthorizedRequest, res: Response) {
    try {
      this.validateReq(req)

      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId as string,
        operation: this.permissionName + ':write',
      })

      const partner: PartnerDomain =
        await this.service.addIdleTruckNotification(
          req.params.id,
          new IdleTruckNotification(req.body),
          req.userId
        )
      res.status(201).json(partner.toObject())
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async updateIdleTruckNotify(req: AuthorizedRequest, res: Response) {
    try {
      this.validateReq(req)

      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId as string,
        operation: this.permissionName + ':write',
      })

      const partner: PartnerDomain = await this.service.updateIdleTruckNotify(
        req.params.partnerId,
        req.params.idleId,
        req.userId,
        new IdleTruckNotification(req.body)
      )
      res.status(200).json(partner.toObject())
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async deleteIdleTruckNotification(req: AuthorizedRequest, res: Response) {
    try {
      this.validateReq(req)

      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId as string,
        operation: this.permissionName + ':write',
      })

      const partner: PartnerDomain = await this.service.deleteIdleTruckNotify(
        req.params.partnerId,
        req.params.idleId,
        req.userId
      )
      res.status(200).json(partner.toObject())
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
}

export default new PartnerController({
  service: PartnerService,
  permissionName: 'partner',
})
