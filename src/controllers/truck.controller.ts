// @ts-nocheck
import { IController } from './iController'
import { TruckService } from '../services'

class TruckController extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }

  async search(req, res) {
    try {
      const data = await this.service.search({
        search: req.query.querySearch,
        type: req.query.type,
        profile: req.query.profile,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new TruckController({
  service: TruckService,
  permissionName: 'truck',
})
