import { IController } from './iController.js'
import PartnerService from '../services/partner/index.js'

class PartnerController extends IController {
  constructor({ service }) {
    super({ service })
    // this.service = service
  }
}
export default new PartnerController({ service: PartnerService })
