export class IController {
  constructor({ service }) {
    this.service = service
  }

  async create(req, res) {
    try {
      const data = await this.service.create({
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
      const data = await this.service.updateOne({
        id: req.params.id,
        body: req.body,
        user: req.userId
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getByProfile(req, res) {
    try {
      const data = await this.service.getByProfile(req.query.profile)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getById(req, res) {
    try {
      const data = await this.service.getById(req.params.id)
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }

  async deleteById(req, res) {
    try {
      const data = await this.service.deleteById({
        id: req.params.id,
        user: req.userId
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}
