import { TransportWaybill } from '@/domain/transportWaybill'
import { dataBuilder } from './dataBuilder'

import printFormsService from '@/services/printFormsService'

/**
 * Строитель печатной формы транспортной накладной (общая)
 * Генерирует PDF через удаленное API
 */
export const commonTransportWaybillPFBuilder = async (
  waybill: TransportWaybill
): Promise<Buffer> => {
  try {
    const data = await dataBuilder(waybill)
    return await printFormsService.generatePdf('tn', data)
  } catch (e) {
    console.error('commonTransportWaybillPFBuilder error', e)
    throw e
  }
}
