import { BadRequestError } from '@/helpers/errors'
import { ICommonActIncomingInvoiceData } from './interfaces'
import {
  IncomingInvoiceRepository,
  CarrierRepository,
  CarrierAgreementRepository,
  OrderRepository,
} from '@/repositories'

import { mainTableRowBuilder } from './mainTableRowsBuilder'
import { ICommonDocMainTableRowProps } from '@/shared/printForms/interfaces'

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
  let ordersData: ICommonDocMainTableRowProps[] = []

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
      docName: 'Акт',
      number: invoice.number,
      date: invoice.date,
    },
    headerTable: {
      executorTitle: 'Исполнитель',
      executor: executorCarrier.getPFdata.fullDataString,
      customerTitle: 'Заказчик',
      customer: customerCarrier.companyInfo?.getFullDataString() ?? '',
      basis: carrierAgreement.actBasis || 'Основной договор',
    },
    mainTable: {
      rows: ordersData,
      mainColumnTitle: 'Наименование работ, услуг',
    },
    resultTable: {
      priceWithVat: invoice?.priceWithVat ?? 0,
      priceWOVat: invoice?.priceWOVat ?? 0,
      count: invoice?.ordersCount ?? 0,
      vatRate: carrierAgreement?.vatRate ?? 0,
      showTotalToPay: false,
      serviceTitle: 'Всего оказано услуг',
    },
    description:
      carrierAgreement.actDescription ||
      'Вышеперечисленные услуги выполнены полностью и в срок. Заказчик претензий по объему, качеству и срокам оказания услуг не имеет.',
  }
}
