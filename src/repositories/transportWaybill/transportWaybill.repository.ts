import { TransportWaybillModel } from './transportWaybill.model'
import { TransportWaybill } from '@/domain/transportWaybill'
import { BadRequestError } from '@/helpers/errors'

interface IProps {
  model: typeof TransportWaybillModel
}

interface IUpdateWaybillProps {
  id: string
  data: Partial<TransportWaybill>
}

class TransportWaybillRepository {
  model: typeof TransportWaybillModel

  constructor(p: IProps) {
    this.model = p.model as typeof TransportWaybillModel
  }

  async create(p: unknown): Promise<TransportWaybill> {
    const waybill = await this.model.create(p)
    return new TransportWaybill(waybill)
  }

  async getById(id: string): Promise<TransportWaybill> {
    const waybill = await this.model.findById(id)
    if (!waybill)
      throw new BadRequestError(
        `TransportWaybillRepository : getById : waybill ${id} not found`
      )
    return new TransportWaybill(waybill)
  }

  async getByOrderId(orderId: string): Promise<TransportWaybill[]> {
    const waybills = await this.model.find({ orderId })
    return waybills.map((w) => new TransportWaybill(w))
  }

  async updateOne(props: IUpdateWaybillProps): Promise<TransportWaybill> {
    const { id, data } = props
    const waybill = await this.model.findByIdAndUpdate(id, data, { new: true })
    if (!waybill)
      throw new BadRequestError(
        `TransportWaybillRepository : updateOne : waybill ${id} not found`
      )
    return new TransportWaybill(waybill)
  }

  async deleteById(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id)
    if (!result)
      throw new BadRequestError(
        `TransportWaybillRepository : deleteById : waybill ${id} not found`
      )
  }
}

export default new TransportWaybillRepository({
  model: TransportWaybillModel,
})
