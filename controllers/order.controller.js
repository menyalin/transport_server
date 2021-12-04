import { OrderService as service } from '../services/index.js'

class OrderController {
  async create(req, res) {
    try {
      const data = await service.create({ body: req.body, user: req.userId })
      res.status(201).json(data)
    } catch (e) {
      res.status(500).json({ mesasge: e.message })
    }
  }

  async updateOne(req, res) {
    try {
      const data = await service.updateOne({
        id: req.params.id,
        body: req.body,
        user: req.userId
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }

  async getList(req, res) {
    try {
      if (!req.query.profile)
        res.status(400).json({ message: 'bad query params' })
      const data = await service.getList(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ mesasge: e.message })
    }
  }

  async getListForSchedule(req, res) {
    try {
      if (!req.query.profile)
        res.status(400).json({ message: 'bad query params' })
      const data = await service.getListForSchedule(req.query)
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
      const data = await service.deleteById({
        id: req.params.id,
        user: req.userId
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}

export default new OrderController()
