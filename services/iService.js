export default class IService {
  constructor({ model, emitter, modelName }) {
    this.model = model
    this.emitter = emitter
    this.modelName = modelName
  }

  async create(body) {
    const data = await this.model.create(body)
    this.emitter(data.company.toString(), `${this.modelName}:created`, data)
    return data
  }

  async updateOne(id, body) {
    const data = await this.model.findByIdAndUpdate(id, body, { new: true })
    this.emitter(data.company.toString(), `${this.modelName}:updated`, data)
    return data
  }

  async getByProfile(profile) {
    const data = await this.model
      .find({ company: profile, isActive: true })
      .lean()
    return data
  }

  async getById(id) {
    const data = await this.model.findById(id).lean()
    return data
  }

  async deleteById(id) {
    const data = await this.model.findByIdAndUpdate(id, { isActive: false })
    this.emitter(data.company.toString(), `${this.modelName}:deleted`, id)
    return data
  }
}
