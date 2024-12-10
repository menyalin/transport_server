import { Driver } from '@/domain/driver/driver'
import { Driver as DriverModel } from '@/models'

interface IProps {
  model: typeof DriverModel
}

class DriverRepository {
  driverModel: typeof DriverModel
  constructor({ model }: IProps) {
    this.driverModel = model
  }

  async getById(id: string): Promise<Driver | null> {
    const doc = await this.driverModel.findById(id).lean()
    if (!doc) return null
    return new Driver(doc)
  }
}

export default new DriverRepository({
  model: DriverModel,
})
