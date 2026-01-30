import * as tasks from './tasks/index'
import cron from 'node-cron'

class SchedulerService {
  constructor() {
    const croneParams = process.env.CRONE_PARAMS || '*/10 * * * *'
    cron.schedule(croneParams, async () => {
      await tasks.sendIdleTruckNotificationMessages(new Date())
    })
  }
}

export default new SchedulerService()
