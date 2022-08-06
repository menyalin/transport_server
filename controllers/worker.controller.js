import { IController } from './iController.js'
import { WorkerService } from '../services/index.js'

class WorkerController extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }
}

export default new WorkerController({
  service: WorkerService,
  permissionName: 'worker',
})
