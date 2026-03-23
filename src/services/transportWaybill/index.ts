import { TransportWaybill } from '@/domain/transportWaybill'
import { TransportWaybillRepository } from '@/repositories'
import { ChangeLogService } from '..'

class TransportWaybillService {
  collectionName = 'transportWaybills'
  async create({
    body,
    user,
  }: {
    body: any
    user: string
  }): Promise<TransportWaybill> {
    const waybill = await TransportWaybillRepository.create(body)

    await ChangeLogService.add({
      docId: waybill._id,
      company: waybill.company,
      coll: this.collectionName,
      user,
      opType: 'create',
      body: waybill,
    })
    return waybill
  }

  async getById(id: string): Promise<TransportWaybill> {
    return await TransportWaybillRepository.getById(id)
  }

  async getByOrderId(orderId: string): Promise<TransportWaybill[]> {
    return await TransportWaybillRepository.getByOrderId(orderId)
  }

  async updateOne({
    id,
    body,
    user,
  }: {
    id: string
    body: any
    user: string
  }): Promise<TransportWaybill> {
    const waybill = await TransportWaybillRepository.updateOne({
      id,
      data: body,
    })

    await ChangeLogService.add({
      docId: waybill._id,
      company: waybill.company,
      coll: this.collectionName,
      user,
      opType: 'update',
      body: waybill,
    })
    return waybill
  }

  async deleteById({ id, user }: { id: string; user: string }): Promise<void> {
    const waybill = await TransportWaybillRepository.getById(id)
    await TransportWaybillRepository.deleteById(id)

    await ChangeLogService.add({
      docId: id,
      company: waybill.company,
      coll: this.collectionName,
      user,
      opType: 'delete',
      body: {},
    })
  }

  async getList(params: any): Promise<TransportWaybill[]> {
    if (params.orderId) {
      return await TransportWaybillRepository.getByOrderId(params.orderId)
    }
    return []
  }
}

export default new TransportWaybillService()
