import { BadRequestError } from '@/helpers/errors'
import {
  ICommonActIncomingInvoiceData,
  IMainTableFragmentProps,
  IMainTableRowFragmentProps,
} from './interfaces'
import {
  IncomingInvoiceRepository,
  CarrierRepository,
  CarrierAgreementRepository,
  OrderRepository,
} from '@/repositories'

import { IncomingInvoiceOrder } from '@/domain/incomingInvoice'
import { mainTableRowBuilder } from './mainTableRowsBuilder'

export const incomingInvoiceDataBuilder = async (
  invoiceId: string
): Promise<ICommonActIncomingInvoiceData> => {
  const invoice = await IncomingInvoiceRepository.getById(invoiceId)
  if (!invoice) throw new BadRequestError('Invoice not found')

  const executorCarrier = await CarrierRepository.getById(invoice.carrier)
  if (!executorCarrier) throw new BadRequestError('Исполнитель не определен')

  const carrierAgreement = await CarrierAgreementRepository.getById(
    invoice.agreement
  )
  if (!carrierAgreement)
    throw new BadRequestError('Соглашение с перевозчиком не найдено')
  if (!carrierAgreement.customer)
    throw new BadRequestError('В соглашении с ТК заказчик не определен')

  const customerCarrier = await CarrierRepository.getById(
    carrierAgreement.customer
  )
  if (!customerCarrier) throw new BadRequestError('Заказчик не найден')
  let ordersData: IMainTableRowFragmentProps[] = []

  for (const orderInInvoice of invoice.orders) {
    const data = await OrderRepository.getFullOrderDataDTO(orderInInvoice.order)
    ordersData.push(mainTableRowBuilder(data, orderInInvoice.total))
  }

  return {
    signatories: {
      customerCompanyName: customerCarrier.getPFdata.fullName,
      executorCompanyName: executorCarrier.getPFdata.fullName,
      executorSignatoryPosition: executorCarrier.getPFdata.signatoryPosition,
      executorSignatoryName: executorCarrier.getPFdata.signatoryName,
    },
    titleData: {
      number: invoice.number,
      date: invoice.date,
    },
    headerTable: {
      executor: executorCarrier.getPFdata.fullDataString,
      customer: customerCarrier.companyInfo?.getFullDataString(),
      basis: carrierAgreement.actBasis ?? 'Основной договор',
    },
    mainTable: {
      rows: ordersData,
    },
    resultTable: {
      priceWithVat: invoice?.priceWithVat ?? 0,
      priceWOVat: invoice?.priceWOVat ?? 0,
      ordersCount: invoice?.ordersCount ?? 0,
      vatRate: carrierAgreement?.vatRate ?? 0,
    },
    description:
      carrierAgreement.actDescription ??
      'Вышеперечисленные услуги выполнены полностью и в срок. Заказчик претензий по объему, качеству и срокам оказания услуг не имеет.',
  }
}
