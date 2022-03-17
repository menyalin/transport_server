import {
  OrderService as service,
  PermissionService
} from '../services/index.js'

class OrderController {
  async create(req, res) {
    try {
      const data = await service.create({ body: req.body, user: req.userId })
      res.status(201).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async createFromTemplate(req, res) {
    try {
      const data = await service.createFromTemplate({
        body: req.body,
        user: req.userId
      })
      res.status(201).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
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
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getList(req, res) {
    try {
      if (!req.query.profile)
        res.status(400).json({ message: 'bad query params' })
      await PermissionService.checkPeriod({
        userId: req.userId,
        companyId: req.companyId,
        startDate: req.query.startDate,
        operation: 'order:daysForRead'
      })
      const data = await service.getList(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getListForSchedule(req, res) {
    try {
      if (!req.query.profile)
        res.status(400).json({ message: 'bad query params' })
      const data = await service.getListForSchedule(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getById(req, res) {
    try {
      const data = await service.getById(req.params.id)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
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
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getDistance(req, res) {
    try {
      const data = await service.getDistance(req.body)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new OrderController()
