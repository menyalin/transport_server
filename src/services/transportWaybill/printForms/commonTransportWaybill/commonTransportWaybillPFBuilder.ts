import { TransportWaybill } from '@/domain/transportWaybill'
import { dataBuilder } from './dataBuilder'
import printFormsService from '@/services/printFormsService'
import dayjs from 'dayjs'

export const commonTransportWaybillPFBuilder = async (
  waybill: TransportWaybill
): Promise<{ buffer: Buffer; filename: string }> => {
  const data = await dataBuilder(waybill)
  const dateStr = waybill.date ? dayjs(waybill.date).format('DD.MM.YYYY') : ''
  const preFilename = `${waybill.number}_${dateStr}-${data.shipper.shortLoadingAddress.trim()}-${data.consignee.shortUnloadingAddress.trim()}-${data.driver.surname?.trim()}`

  const filename = preFilename.replace(/[^a-zA-Z0-9а-яА-Я\-_]/g, '_')

  return { buffer: await printFormsService.generatePdf('tn', data), filename }
}
