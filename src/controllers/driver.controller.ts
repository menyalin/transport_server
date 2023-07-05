import { IController } from './iController.js'
import { DriverService } from '../services/index.js'

class DriverController extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }

  async search(req, res) {
    try {
      const data = await DriverService.search({
        search: req.query.querySearch,
        profile: req.query.profile
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new DriverController({
  service: DriverService,
  permissionName: 'driver'
})
