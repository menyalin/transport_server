import { IController } from './iController.js'
import { DocumentService } from '../services/index.js'

class PartnerController extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }
}

export default new PartnerController({
  service: DocumentService,
  permissionName: 'document',
})
