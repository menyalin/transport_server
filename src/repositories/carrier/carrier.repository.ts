import { Carrier } from '@/domain/carrier/carrier'
import { TkName as CarrierModel } from '@/models'
import { createGetListPipeline } from './pipelines/listPipeline'
import { TtlMap } from '@/utils/ttlMap'

interface IProps {
  model: typeof CarrierModel
}

class CarrierRepository {
  model: typeof CarrierModel
  private cache: TtlMap<string, Carrier | null>

  constructor({ model }: IProps) {
    this.model = model
    this.cache = new TtlMap(5 * 60 * 1000) // 5 минут
  }

  async getById(id: string): Promise<Carrier | null> {
    const cached = this.cache.get(id)
    if (cached !== undefined) {
      return cached
    }

    const doc = await this.model.findById(id).lean()
    const result = doc ? new Carrier(doc) : null

    this.cache.set(id, result)
    return result
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
    if (!carrier._id) return

    await this.model.updateOne({ _id: carrier._id }, carrier)
    this.cache.set(carrier._id, carrier)
  }
}

export default new CarrierRepository({
  model: CarrierModel,
})
