import { TransportWaybillRepository } from '@/repositories'
import { commonTransportWaybillPFBuilder } from './commonTransportWaybill/commonTransportWaybillPFBuilder'

interface IPFBuilderProps {
  transportWaybillId: string
  templateName: string
}

export const transportWaybillPFBuilder = async ({
  transportWaybillId,
  templateName,
}: IPFBuilderProps): Promise<Buffer> => {
  if (!transportWaybillId || !templateName)
    throw new Error('orderPFBuilder : required args is missing')
  const transportWaybill =
    await TransportWaybillRepository.getById(transportWaybillId)
  let builder = commonTransportWaybillPFBuilder
  return await builder(transportWaybill)
}
