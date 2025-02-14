import { Vehicle } from '@/domain/vehicle/vehicle'
import { Truck as TruckModel } from '@/models'

interface IProps {
  model: typeof TruckModel
}

class VehicleRepository {
  model: typeof TruckModel
  constructor({ model }: IProps) {
    this.model = model
  }

  async getById(id: string): Promise<Vehicle | null> {
    const doc = await this.model.findById(id).lean()
    if (!doc) return null
    return new Vehicle(doc)
  }
}

export default new VehicleRepository({ model: TruckModel })
