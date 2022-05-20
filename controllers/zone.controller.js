import { IController } from './iController.js'
import { ZoneService } from '../services/index.js'

class Controller extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }
}

export default new Controller({
  service: ZoneService,
  permissionName: 'zone',
})
