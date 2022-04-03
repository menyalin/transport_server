import { Driver, Order, Truck } from '../../models/index.js'
import { FileService } from '../index.js'
import getReportDaysControlPipeline from '../report/pipelines/reportDaysControlPipeline.js'
import getInProgressOrdersPipeline from './pipelines/inProgressOrdersPipeline.js'
import getTruckStateOnDatePipeline from './pipelines/truckStateOnDatePipeline.js'
import getDriversGradesAppayPipeline from './pipelines/driversGradesArray.js'

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

export default new ReportService({ Driver })
