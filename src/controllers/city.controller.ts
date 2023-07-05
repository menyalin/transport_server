// @ts-nocheck
import { IController } from './iController.js'
import { CityService } from '../services/index.js'

class Controller extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }
}

export default new Controller({
  service: CityService,
  permissionName: 'city',
})
