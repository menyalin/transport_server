import { IController } from './iController.js'
import { DowntimeService } from '../services/index.js'

class DowntimeController extends IController {
  constructor({ service }) {
    super({ service })
    this.service = service
  }
}

export default new DowntimeController({ service: DowntimeService })
