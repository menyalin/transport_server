// @ts-nocheck
import { IController } from './iController'
import { RegionService } from '../services'

class Controller extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }
}

export default new Controller({
  service: RegionService,
  permissionName: 'region',
})
