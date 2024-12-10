import { Response } from 'express'
import { AgreementService, PermissionService } from '@/services'
import { AuthorizedRequest } from './interfaces'
import { BadRequestError } from '@/helpers/errors'

interface IProps {
  service: typeof AgreementService
  permissionService: typeof PermissionService
  permissionName: string
}

class AgreementController {
  service: typeof AgreementService
  permissionService: typeof PermissionService
  permissionName: string
  constructor({ service, permissionName, permissionService }: IProps) {
    this.permissionService = permissionService
    this.permissionName = permissionName
    this.service = service
  }

  async getList(req: AuthorizedRequest, res: Response) {
    try {
      const data = await this.service.getList(req.query)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getForOrder(req: AuthorizedRequest, res: Response) {
    try {
      const data = await this.service.getForOrder(req.query)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getForClient(req: AuthorizedRequest, res: Response) {
    try {
      if (!req.companyId) throw new BadRequestError('Missing companyId')

      const data = await this.service.getForClient({
        ...req.query,
        company: req.companyId,
      })
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
  async create(req: AuthorizedRequest, res: Response) {
    try {
      if (!req.companyId) throw new BadRequestError('Missing companyId')

      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':write',
      })

      const data = await this.service.create({
        body: req.body,
        user: req.userId,
      })
      res.status(201).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async updateOne(req: AuthorizedRequest, res: Response) {
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
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getByProfile(req: AuthorizedRequest, res: Response) {
    try {
      if (!req.query?.profile)
        res.status(400).json({ message: 'bad query params' })

      const data = await this.service.getByProfile(req.query.profile as string)
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

  async deleteById(req: AuthorizedRequest, res: Response) {
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
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
}

export default new AgreementController({
  service: AgreementService,
  permissionService: PermissionService,
  permissionName: 'agreement',
})
