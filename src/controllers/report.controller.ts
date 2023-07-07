import { Request, Response } from 'express'
import { IReportService } from '../services/report'
import { BadRequestError } from '../helpers/errors'
import { DateRange } from '../classes/dateRange'
import { ReportService } from '../services'

interface IServiceProps {
  service: IReportService
}

interface IDaysControlProps {
  days: string
  profile: string
}

interface ITruckStateOnDateProps {
  company: string
  date: string
  truckType: string
  tkName: string
}

interface IDriversGradesReportProps {
  company: string
  dateRange: string[]
}

class ReportController {
  service: IReportService
  constructor({ service }: IServiceProps) {
    this.service = service
  }

  async daysControl(
    req: Request<{}, {}, {}, IDaysControlProps>,
    res: Response
  ) {
    try {
      let days: number = 30
      if (!!req.query.days && !isNaN(parseInt(req.query.days as string)))
        days = parseInt(req.query.days as string)

      const data = await this.service.daysControl(days, req.query.profile)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) {
        res.status(e.statusCode || 500).json(e.message)
      } else {
        res.status(500).json(e)
      }
    }
  }

  async inProgressOrders(req: Request, res: Response) {
    try {
      const data = await this.service.inProgressOrders({
        profile: req.query.profile,
        client: req.query.client,
      })
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) {
        res.status(e.statusCode || 500).json(e.message)
      } else {
        res.status(500).json(e)
      }
    }
  }

  async truckStateOnDate(
    req: Request<{}, {}, {}, ITruckStateOnDateProps>,
    res: Response
  ) {
    try {
      const data = await this.service.truckStateOnDate({
        company: req.query.company,
        date: new Date(req.query.date),
        truckType: req.query.truckType,
        tkName: req.query.tkName,
      })
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) {
        res.status(e.statusCode || 500).json(e.message)
      } else {
        res.status(500).json(e)
      }
    }
  }

  async driversGradesXlsxReport(
    req: Request<{}, {}, IDriversGradesReportProps>,
    res: Response
  ) {
    try {
      const report = await this.service.driversGradesXlsxReport({
        company: req.body.company,
        dateRange: new DateRange(req.body.dateRange[0], req.body.dateRange[1]),
      })
      res.status(200)
      report.pipe(res)
    } catch (e) {
      if (e instanceof BadRequestError) {
        res.status(e.statusCode || 500).json(e.message)
      } else {
        res.status(500).json(e)
      }
    }
  }

  async grossProfit(req: Request, res: Response) {
    try {
      const data = await this.service.grossProfit({
        company: req.body.company,
        dateRange: req.body.dateRange,
      })
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) {
        res.status(e.statusCode || 500).json(e.message)
      } else {
        res.status(500).json(e)
      }
    }
  }

  async grossProfitPivot(req: Request, res: Response) {
    try {
      const data = await this.service.grossProfitPivot({
        company: req.body.company,
        dateRange: req.body.dateRange,
        groupBy: req.body.groupBy,
        mainFilters: req.body.mainFilters,
      })
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) {
        res.status(e.statusCode || 500).json(e.message)
      } else {
        res.status(500).json(e)
      }
    }
  }

  async grossProfitDetails(req: Request, res: Response) {
    try {
      const data = await this.service.grossProfitDetails({
        company: req.body.company,
        dateRange: req.body.dateRange,
        mainFilters: req.body.mainFilters,
        listOptions: req.body.listOptions,
        additionalFilters: req.body.additionalFilters,
      })
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) {
        res.status(e.statusCode || 500).json(e.message)
      } else {
        res.status(500).json(e)
      }
    }
  }

  async orderDocs(req: Request, res: Response) {
    try {
      const data = await this.service.orderDocs(req.body)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) {
        res.status(e.statusCode || 500).json(e.message)
      } else {
        res.status(500).json(e)
      }
    }
  }
}

export default new ReportController({
  service: ReportService as IReportService,
})
