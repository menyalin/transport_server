import { IController } from './iController'
import { SalaryTariffService, PermissionService } from '../services'
import { AuthorizedRequest } from './interfaces'
import { Response } from 'express'
import { BadRequestError } from '@/helpers/errors'
interface IConstructorProps {
  service: typeof SalaryTariffService
  permissionName: string
}
class SalaryTariffController extends IController {
  service: typeof SalaryTariffService
  permissionName: string

  constructor({ service, permissionName }: IConstructorProps) {
    super({ service, permissionName })
    this.service = service
    this.permissionName = permissionName
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
  // async driversSalaryByPeriodReport(req: AuthorizedRequest, res: Response) {}

  async getDriversSalaryByPeriod(req: AuthorizedRequest, res: Response) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':readList',
      })

      const data = await this.service.getDriversSalaryByPeriod(req.body)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
}

export default new SalaryTariffController({
  service: SalaryTariffService,
  permissionName: 'salaryTariff',
})
