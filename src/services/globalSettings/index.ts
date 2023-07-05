// @ts-nocheck
import { BadRequestError } from '../../helpers/errors.js'
import { GlobalSettings as model } from '../../models/index.js'

class Service {
  async create(body) {
    const existSettings = await model.findOne().lean()
    if (existSettings)
      throw new BadRequestError(
        'Запись с глобальными настройками уже существует',
      )
    const settings = await model.create(body)
    return settings
  }

  async get() {
    return await model.findOne().lean()
  }
}

export default new Service()
