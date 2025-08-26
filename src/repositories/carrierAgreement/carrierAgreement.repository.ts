import { CarrierAgreement } from '@/domain/carrierAgreement'
import { CarrierAgreementModel } from './models'

import { ICarrierAgreementListData } from '@/domain/carrierAgreement/interfaces'
import { createGetListPipeline } from './pipelines/createGetListPipeline'

interface IProps {
  model: typeof CarrierAgreementModel
}

class CarrierAgreementRepository {
  model: typeof CarrierAgreementModel
  constructor({ model }: IProps) {
    this.model = model
  }

  async create(data: unknown): Promise<CarrierAgreement> {
    const res = await this.model.create(data)
    return new CarrierAgreement(res)
  }

  async getById(id: string): Promise<CarrierAgreement | null> {
    const res = await this.model.findById(id).lean()
    return res ? new CarrierAgreement(res) : null
  }

  async getByIds(ids: string[]): Promise<CarrierAgreement[]> {
    const res = await this.model.find({ _id: { $in: ids } }).lean()
    return res.map((item) => new CarrierAgreement(item))
  }

  async getList(params: unknown): Promise<ICarrierAgreementListData> {
    const pipeline = createGetListPipeline(params)
    const res = await this.model.aggregate(pipeline)
    return {
      items: res[0]?.items ?? [],
      total: res[0]?.count[0]?.count ?? 0,
    }
  }

  async update(item: CarrierAgreement): Promise<CarrierAgreement | null> {
    const res = await this.model.findByIdAndUpdate(item._id, item, {
      new: true,
    })

    return res ? new CarrierAgreement(res) : null
  }

  async deleteById(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id)
  }
}

export default new CarrierAgreementRepository({
  model: CarrierAgreementModel,
})
