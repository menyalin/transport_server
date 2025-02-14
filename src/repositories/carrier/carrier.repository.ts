import { Carrier } from '@/domain/carrier/carrier'
import { TkName as CarrierModel } from '@/models'
import { createGetListPipeline } from './pipelines/listPipeline'

interface IProps {
  model: typeof CarrierModel
}

class CarrierRepository {
  model: typeof CarrierModel
  constructor({ model }: IProps) {
    this.model = model
  }
  async getById(id: string): Promise<Carrier | null> {
    const doc = await this.model.findById(id).lean()
    if (!doc) return null
    return new Carrier(doc)
  }

  async getList(params: unknown): Promise<{ items: any; count: number }> {
    const pipeline = createGetListPipeline(params)
    const res = await this.model.aggregate(pipeline)
    return {
      items: res[0]?.items ?? [],
      count: res[0]?.count[0]?.count ?? 0,
    }
  }

  async update(carrier: Carrier): Promise<void> {
    await this.model.updateOne({ _id: carrier._id }, carrier)
  }
}

export default new CarrierRepository({
  model: CarrierModel,
})
