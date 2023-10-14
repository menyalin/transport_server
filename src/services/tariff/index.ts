// @ts-nocheck
import ChangeLogService from '../changeLog'
import { Tariff } from '../../models'
import TariffRepository from '../../repositories/tariff/tariff.repository'
import { emitTo } from '../../socket'
import IService from '../iService'
import getBasePrice from './getBasePrice'
import getAdditionalPointsPrice from './getAdditionalPointsPrice'
import getWaitingPrices from './getWaitingPrices'
import getReturnPrice from './getReturnPrice'
import { createTariff } from '../../domain/tariff/tariff.creator'

class TariffService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
    this.model = model
    this.logService = logService
  }

  async create({ body, user, company }) {
    try {
      const data = await TariffRepository.create(
        Array.isArray(body) ? body : [body]
      )
      await this.logService.addArray({
        array: data,
        coll: 'tariff',
        opType: 'create',
        user,
        company,
      })

      return data
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async updateOne({ id, body, user }) {
    const tariff = await TariffRepository.updateById(id, createTariff(body))

    await this.logService.add({
      docId: tariff._id.toString(),
      coll: this.modelName,
      opType: 'update',
      user,
      company: tariff.company.toString(),
      body: tariff,
    })
    return tariff
  }

  async getList(params) {
    const data = await TariffRepository.getList(params)
    return data
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

  async deleteById({ id, user, company }) {
    await TariffRepository.removeById(id)
    this.emitter(company.toString(), `${this.modelName}:deleted`, id)

    await this.logService.add({
      docId: id,
      coll: this.modelName,
      opType: 'delete',
      user,
      company: company.toString(),
    })
    return true
  }
}

export default new TariffService({
  model: Tariff,
  emitter: emitTo,
  modelName: 'tariff',
  logService: ChangeLogService,
})
