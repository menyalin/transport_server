import { Carrier } from '@/domain/carrier/carrier'
import { TkName as CarrierModel } from '@/models'
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
}

export default new CarrierRepository({
  model: CarrierModel,
})
