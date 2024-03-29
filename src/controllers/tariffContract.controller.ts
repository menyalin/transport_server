import { Response } from 'express'
import { PermissionService, TariffContractService } from '@/services'
import { BadRequestError } from '../helpers/errors'
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
        companyId: req.companyId,
        operation: this.service.modelName + ':write',
      })

      const data = await this.service.create(req.body, req.userId)

      res.status(201).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
}

export default new TariffContractController({
  service: TariffContractService,
})
