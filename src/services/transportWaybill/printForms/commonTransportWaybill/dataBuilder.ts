import { TransportWaybill } from '@/domain/transportWaybill'
import { IDataCommonTransportWaybillPrintForm } from './interfaces'

export const dataBuilder = async (
  waybill: TransportWaybill
): Promise<IDataCommonTransportWaybillPrintForm> => {
  return {
    title: {
      number: waybill.number,
      date: waybill.date,
    },
    shipper: {
      name: 'Имя грузоотправителя',
      inn: '143409-02-23',
    },
  }
}
