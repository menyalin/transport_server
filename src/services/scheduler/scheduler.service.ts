import * as tasks from './tasks/index'
import cron from 'node-cron'

class SchedulerService {
  constructor() {
    cron.schedule(
      '*/10 * * * *',
      async () => {
        await tasks.sendIdleTruckNotificationMessages(new Date())
      },
      { scheduled: true }
    )
  }
}

export default new SchedulerService()
