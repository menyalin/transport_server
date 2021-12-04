export default class IService {
  constructor({ model, emitter, modelName, logService }) {
    this.model = model
    this.emitter = emitter
    this.modelName = modelName
    this.logService = logService
  }

  async create({ body, user }) {
    const data = await this.model.create(body)
    if (this.logService)
      await this.logService.add({
        docId: data._id.toString(),
        coll: this.modelName,
        opType: 'create',
        user,
        company: data.company.toString(),
        body: JSON.stringify(data.toJSON())
      })
    this.emitter(data.company.toString(), `${this.modelName}:created`, data)
    return data
  }

  async updateOne({ id, body, user }) {
    const data = await this.model.findByIdAndUpdate(id, body, { new: true })
    this.emitter(data.company.toString(), `${this.modelName}:updated`, data)
    if (this.logService)
      await this.logService.add({
        docId: data._id.toString(),
        coll: this.modelName,
        opType: 'update',
        user,
        company: data.company.toString(),
        body: JSON.stringify(data.toJSON())
      })
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

  async deleteById({ id, user }) {
    const data = await this.model.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )
    this.emitter(data.company.toString(), `${this.modelName}:deleted`, id)
    if (this.logService)
      await this.logService.add({
        docId: data._id.toString(),
        coll: this.modelName,
        opType: 'delete',
        user,
        company: data.company.toString(),
        body: JSON.stringify(data.toJSON())
      })
    return data
  }
}
