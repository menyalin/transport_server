// @ts-nocheck
import ChangeLogService from '../changeLog'
import { Tariff } from '../../models'
import { emitTo } from '../../socket'
import IService from '../iService'
import getListPipeline from './pipelines/getListPipeline'
import getBasePrice from './getBasePrice'
import getAdditionalPointsPrice from './getAdditionalPointsPrice'
import getWaitingPrices from './getWaitingPrices'
import getReturnPrice from './getReturnPrice'

class TariffService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
    this.model = model
    this.logService = logService
  }

  async create({ body, user, company }) {
    try {
      const data = await this.model.create(body)
      if (Array.isArray(data)) {
        await this.logService.addArray({
          array: data,
          coll: 'tariff',
          opType: 'create',
          user,
          company,
        })
      } else
        await this.logService.add({
          docId: data._id.toString(),
          coll: this.modelName,
          opType: 'create',
          user,
          company: data.company.toString(),
          body: JSON.stringify(data.toJSON()),
        })

      return data
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async updateOne({ id, body, user }) {
    const data = await this.model.findByIdAndUpdate(id, body, { new: true })
    await data.populate('agreement')
    if (this.logService)
      await this.logService.add({
        docId: data._id.toString(),
        coll: this.modelName,
        opType: 'update',
        user,
        company: data.company.toString(),
        body: JSON.stringify(data.toJSON()),
      })
    return data
  }

  async getList(params) {
    try {
      const pipeline = getListPipeline(params)
      const res = await this.model.aggregate(pipeline)
      return res[0]
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async getPrePricesByOrderData(order) {
    const resArray = []
    const basePrice = await getBasePrice(order)
    if (basePrice) {
      resArray.push(basePrice)
    }

    const savedBasePrice = order.prices?.find((i) => i.type === 'base')
    if (savedBasePrice || basePrice) {
      const returnPrice = await getReturnPrice(
        order,
        savedBasePrice || basePrice
      )
      if (returnPrice) resArray.push(returnPrice)
    }

    const additionalPoints = await getAdditionalPointsPrice(order)
    if (additionalPoints) resArray.push(additionalPoints)

    const waitingPrices = await getWaitingPrices(order)
    if (waitingPrices) waitingPrices.forEach((price) => resArray.push(price))

    return resArray
  }
}

export default new TariffService({
  model: Tariff,
  emitter: emitTo,
  modelName: 'tariff',
  logService: ChangeLogService,
})
