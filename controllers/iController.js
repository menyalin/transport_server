export class IController {
  constructor({ service }) {
    this.service = service
  }

  async create(req, res) {
    try {
      const data = await this.service.create(req.body)
      res.status(201).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }

  async updateOne(req, res) {
    try {
      const data = await this.service.updateOne(req.params.id, req.body)
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }

  async getByProfile(req, res) {
    try {
      const data = await this.service.getByProfile(req.query.profile)
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
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
      const data = await this.service.deleteById(req.params.id)
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}
