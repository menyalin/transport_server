import { OrderService as service } from '../services/index.js'

class OrderController {
  async create(req, res) {
    try {
      const data = await service.create(req.body)
      res.status(201).json(data)
    } catch (e) {
      res.status(500).json({ mesasge: e.message })
    }
  }

  async getList(req, res) {
    try {
      if (!req.query.profile)
        res.status(400).json({ message: 'bad query params' })
      const data = await service.getList({ company: req.query.profile })
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ mesasge: e.message })
    }
  }

  async getSchedule(req, res) {
    try {
      if (!req.query.profile)
        res.status(400).json({ message: 'bad query params' })
      const data = await service.getSchedule(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ mesasge: e.message })
    }
  }
}

export default new OrderController()
