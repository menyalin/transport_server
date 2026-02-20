// @ ts-nocheck
import { Driver, Order, Truck } from '@/models'
import { IDateRange } from '@/classes/dateRange'
import { PipelineStage } from 'mongoose'
import { Readable } from 'stream'
import { FileService } from '..'
import getReportDaysControlPipeline from '../report/pipelines/reportDaysControlPipeline'
import getInProgressOrdersPipeline from './pipelines/inProgressOrdersPipeline'
import getTruckStateOnDatePipeline from './pipelines/truckStateOnDatePipeline'
import getDriversGradesAppayPipeline from './pipelines/driversGradesArray'
import getGrossProfitPivotPipeline from './pipelines/grossProfitPivotPipeline'
import getGrossProfitDetailsPipeline from './pipelines/getGrossProfitDetailsPipeline'
import getOrderDocsPipeline from './pipelines/getOrderDocs'

export interface IDriversGradesXlsxReportProps {
  company: string
  dateRange: IDateRange
}

interface ITruckStateOnDateProps {
  company: string
  date: Date
  truckType?: string
  tkName?: string
}

class ReportService {
  async inProgressOrders(props: { profile: string; client: string }) {
    const pipeline = getInProgressOrdersPipeline(props)
    const data = await Order.aggregate(pipeline as PipelineStage[])
    return data
  }

  async daysControl(
    days: number,
    profile: string,
    carriers?: string[]
  ): Promise<unknown[]> {
    const pipeline = getReportDaysControlPipeline(days, profile, carriers)
    const data = await Driver.aggregate(pipeline as PipelineStage[])
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
    const res = await Truck.aggregate(pipeline as PipelineStage[])
    return res
  }

  async orderDocs(params: any) {
    const pipeline = getOrderDocsPipeline(params)
    const res = await Order.aggregate(pipeline as PipelineStage[])
    return res[0] || {}
  }

  async grossProfitPivot({ company, dateRange, groupBy, mainFilters }: any) {
    const pipeline = getGrossProfitPivotPipeline({
      company,
      dateRange,
      groupBy,
      mainFilters,
    })
    const res = await Order.aggregate(pipeline as PipelineStage[])
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
  }: any) {
    const pipeline = getGrossProfitDetailsPipeline({
      company,
      dateRange,
      mainFilters,
      listOptions,
      additionalFilters,
    })
    const res = await Order.aggregate(pipeline as PipelineStage[])
    return res[0] || { items: [], count: 0 }
  }

  async driversGradesXlsxReport({
    company,
    dateRange,
  }: IDriversGradesXlsxReportProps): Promise<Readable> {
    const pipeline = getDriversGradesAppayPipeline({ company, dateRange })
    const array = await Order.aggregate(pipeline as PipelineStage[])

    const stream = await FileService.createExcelFile(
      array.map((i) => ({ ...i, _id: i._id.toString() }))
    )
    return stream
  }
}

export default new ReportService()
