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

  async updateOne(req, res) {
    try {
      const data = await service.updateOne(req.params.id, req.body, req.userId)
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
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

  async getById(req, res) {
    try {
      const data = await service.getById(req.params.id)
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ mesasge: e.message })
    }
  }

  async deleteById(req, res) {
    try {
      const data = await service.deleteById(req.params.id)
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}

export default new OrderController()
