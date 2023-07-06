// @ts-nocheck
import { IController } from './iController'
import { DocumentService } from '../services'

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
