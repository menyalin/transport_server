import { TransportWaybill } from '@/domain/transportWaybill'
import { TransportWaybillRepository } from '@/repositories'
import { ChangeLogService } from '..'
import { emitTo } from '@/socket'

class TransportWaybillService {
  async create({
    body,
    user,
  }: {
    body: any
    user: string
  }): Promise<TransportWaybill> {
    const waybill = await TransportWaybillRepository.create(body)

    emitTo(waybill.orderId.toString(), 'transport-waybill:created', waybill)

    await ChangeLogService.add({
      docId: (waybill as any)._id,
      company: body.company,
      coll: 'transportWaybill',
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
    emitTo(waybill.orderId.toString(), 'transport-waybill:updated', waybill)
    await ChangeLogService.add({
      docId: id,
      company: body.company,
      coll: 'transportWaybill',
      user,
      opType: 'update',
      body: waybill,
    })
    return waybill
  }

  async deleteById({ id, user }: { id: string; user: string }): Promise<void> {
    const waybill = await TransportWaybillRepository.getById(id)
    await TransportWaybillRepository.deleteById({ id })
    emitTo(waybill.orderId.toString(), 'transport-waybill:deleted', id)
    await ChangeLogService.add({
      docId: id,
      company: waybill.orderId,
      coll: 'transportWaybill',
      user,
      opType: 'delete',
      body: waybill,
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
