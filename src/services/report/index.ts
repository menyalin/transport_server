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

class ReportService {
  async inProgressOrders({ profile, client }) {
    const pipeline = getInProgressOrdersPipeline({ profile, client })
    const data = await Order.aggregate(pipeline)
    return data
  }

  async daysControl(days, profile) {
    let parsedDays
    if (!!days && !isNaN(parseInt(days))) parsedDays = parseInt(days)
    const pipeline = getReportDaysControlPipeline(parsedDays, profile)
    const data = await Driver.aggregate(pipeline)
    return data
  }

  async truckStateOnDate({ company, date, truckType, tkName }) {
    const pipeline = getTruckStateOnDatePipeline({
      company,
      date,
      truckType: truckType || 'truck',
      tkName,
    })
    const res = await Truck.aggregate(pipeline)
    return res
  }

  async orderDocs(params) {
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

  async driversGradesGetLink({ company, dateRange }) {
    const pipeline = getDriversGradesAppayPipeline({ company, dateRange })
    const array = await Order.aggregate(pipeline)
    const link = await FileService.createFileLink({
      data: array.map((i) => ({ ...i, _id: i._id.toString() })),
      reportName: 'driversGrades',
    })
    return link
  }
}

export default new ReportService()
