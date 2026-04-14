import { TransportWaybill } from '@/domain/transportWaybill'
import { dataBuilder } from './dataBuilder'

import printFormsService from '@/services/printFormsService'

export const commonTransportWaybillPFBuilder = async (
  waybill: TransportWaybill
): Promise<Buffer> => {
  const data = await dataBuilder(waybill)
  return await printFormsService.generatePdf('tn', data)
}
