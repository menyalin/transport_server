// @ts-nocheck
import { Driver, Order, Truck } from '../../models'
import { FileService } from '..'
import getReportDaysControlPipeline from '../report/pipelines/reportDaysControlPipeline'
import getInProgressOrdersPipeline from './pipelines/inProgressOrdersPipeline'
import getTruckStateOnDatePipeline from './pipelines/truckStateOnDatePipeline'
import getDriversGradesAppayPipeline from './pipelines/driversGradesArray'
import getGrossProfitPipeline from './pipelines/grossProfitPipeline'
import getGrossProfitPivotPipeline from './pipelines/grossProfitPivotPipeline'
import getGrossProfitDetailsPipeline from './pipelines/getGrossProfitDetailsPipeline'
import getOrderDocsPipeline from './pipelines/getOrderDocs'
import { IDateRange } from '../../classes/dateRange'

export interface IDriversGradesXlsxReportProps {
  company: string
  dateRange: IDateRange
}

interface ITruckStateOnDateProps {
  company: string
  date: Date
  truckType: string
  tkName: string
}

export interface IReportService {
  driversGradesXlsxReport: (
    props: IDriversGradesXlsxReportProps
  ) => Promise<Readable>

  daysControl: (days: number, profile: string) => Promise<unknown[]>

  inProgressOrders: ({ profile: string, client: string }) => Promise<unknown[]>

  truckStateOnDate: (props: ITruckStateOnDateProps) => Promise<unknown[]>

  orderDocs: (props: unknown) => Promise<unknown>

  grossProfit: (props: unknown) => Promise<unknown>

  grossProfitPivot: (props: unknown) => Promise<unknown>

  grossProfitDetails: (props: unknown) => Promise<unknown>
}

class ReportService implements IReportService {
  async inProgressOrders({ profile, client }) {
    const pipeline = getInProgressOrdersPipeline({ profile, client })
    const data = await Order.aggregate(pipeline)
    return data
  }

  async daysControl(days, profile): Promise<unknown[]> {
    const pipeline = getReportDaysControlPipeline(days, profile)
    const data = await Driver.aggregate(pipeline)
    return data
  }

  async truckStateOnDate({
    company,
    date,
    truckType,
    tkName,
  }: ITruckStateOnDateProps) {
    const pipeline = getTruckStateOnDatePipeline({
      company: company,
      date: date,
      truckType: truckType || 'truck',
      tkName: tkName,
    })
    const res = await Truck.aggregate(pipeline)
    return res
  }

  async orderDocs(params: unknown) {
    const pipeline = getOrderDocsPipeline(params)
    const res = await Order.aggregate(pipeline)
    return res[0] || {}
  }

  async grossProfit({ company, dateRange }) {
    const pipeline = getGrossProfitPipeline({ company, dateRange })
    const res = await Order.aggregate(pipeline)
    return res[0] || {}
  }

  async grossProfitPivot({ company, dateRange, groupBy, mainFilters }) {
    const pipeline = getGrossProfitPivotPipeline({
      company,
      dateRange,
      groupBy,
      mainFilters,
    })
    const res = await Order.aggregate(pipeline)
    return {
      pivot: res[0] || {},
    }
  }

  async grossProfitDetails({
    company,
    dateRange,
    mainFilters,
    additionalFilters,
    listOptions,
  }) {
    const pipeline = getGrossProfitDetailsPipeline({
      company,
      dateRange,
      mainFilters,
      listOptions,
      additionalFilters,
    })
    const res = await Order.aggregate(pipeline)
    if (Array.isArray(res) && !Array.isArray(res[0]?.items)) {
      return { items: [], count: 0 }
    } else return res[0]
  }

  async driversGradesXlsxReport({
    company,
    dateRange,
  }: IDriversGradesXlsxReportProps): Promise<Readable> {
    const pipeline = getDriversGradesAppayPipeline({ company, dateRange })
    const array = await Order.aggregate(pipeline)

    const stream = await FileService.createExcelFile(
      array.map((i) => ({ ...i, _id: i._id.toString() }))
    )
    return stream
  }
}

export default new ReportService()
