import { Driver, Order } from '../../models/index.js'
import getReportDaysControlPipeline from '../report/pipelines/reportDaysControlPipeline.js'
import getInProgressOrdersPipeline from './pipelines/inProgressOrdersPipeline.js'

class ReportService {
  constructor({ Driver }) {
    this.DriverModel = Driver
  }

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
}

export default new ReportService({ Driver })
