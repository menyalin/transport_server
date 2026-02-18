import { Response } from 'express'
import { PermissionService, TariffContractService } from '@/services'
import { BadRequestError, CustomError } from '../helpers/errors'
import { AuthorizedRequest } from '@/controllers/interfaces'

interface IConstructorProps {
  service: typeof TariffContractService
}

class TariffContractController {
  service: typeof TariffContractService

  constructor({ service }: IConstructorProps) {
    this.service = service
  }

  async create(req: AuthorizedRequest, res: Response): Promise<void> {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId as string,
        operation: this.service.modelName + ':write',
      })

      const data = await this.service.create(req.body, req.userId)

      res.status(201).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getById(req: AuthorizedRequest, res: Response): Promise<any> {
    try {
      const data = await this.service.getById(req.params.id)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof CustomError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getList(req: AuthorizedRequest, res: Response): Promise<any> {
    try {
      const data = await this.service.getList({
        ...req.query,
        company: req.companyId as string,
      })
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof CustomError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async updateOne(req: AuthorizedRequest, res: Response): Promise<any> {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId as string,
        operation: this.service.modelName + ':write',
      })

      const data = await this.service.updateOne(
        req.params.id,
        req.body,
        req.userId
      )
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof CustomError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
  async deleteById(req: AuthorizedRequest, res: Response): Promise<any> {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId as string,
        operation: this.service.modelName + ':delete',
      })
      const data = await this.service.deleteById(req.params.id, req.userId)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof CustomError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
}

export default new TariffContractController({
  service: TariffContractService,
})
