import { Driver } from '../../models/index.js'
import getReportDaysControlPipeline from '../report/pipelines/reportDaysControlPipeline.js'

class ReportService {
  constructor({ Driver }) {
    this.DriverModel = Driver
  }

  async daysControl(days, profile) {
    let parsedDays
    if (!!days && parseInt(days)) parsedDays = parseInt(days)
    const pipeline = getReportDaysControlPipeline(parsedDays, profile)
    const data = await Driver.aggregate(pipeline)
    return data
  }
}

export default new ReportService({ Driver })
