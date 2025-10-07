import * as tasks from './tasks/index'
import cron from 'node-cron'

class SchedulerService {
  constructor() {
    const croneParams = process.env.CRONE_PARAMS || '*/1 * * * *'
    cron.schedule(croneParams, async () => {
      console.log('sendIdleTruckNotificationMessages')
      await tasks.sendIdleTruckNotificationMessages(new Date())
    })
  }
}

export default new SchedulerService()
