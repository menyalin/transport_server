import { BadRequestError } from '@/helpers/errors'
import {
  AgreementRepository,
  CarrierRepository,
  OrderRepository,
  PaymentInvoiceRepository,
} from '@/repositories'

import { mainTableRowBuilder } from './mainTableRowsBuilder'
import { ICommonDocMainTableRowProps } from '@/shared/printForms/interfaces'
import { ICommonActData } from '@/shared/printForms'

export const incomingInvoiceDataBuilder = async (
  invoiceId: string
): Promise<ICommonActData> => {
  const invoice = await PaymentInvoiceRepository.getInvoiceById(invoiceId)
  if (!invoice) throw new BadRequestError('Invoice not found')
  if (!invoice?.orders) throw new BadRequestError('Orders not found')
  let ordersData: ICommonDocMainTableRowProps[] = []

  const clientAgreement = await AgreementRepository.getById(invoice.agreementId)
  if (!clientAgreement)
    throw new BadRequestError('Cоглашение с клиентом не найдено')
  if (!clientAgreement?.executor)
    throw new BadRequestError(
      'В соглашении с клиентом не указан основной исполнитель'
    )

  const executorCarrier = await CarrierRepository.getById(
    clientAgreement.executor
  )
  if (!executorCarrier) throw new BadRequestError('Исполнитель не определен')

  // const carrierAgreement = await CarrierAgreementRepository.getById(
  //   invoice.agreement
  // )
  // if (!carrierAgreement)
  //   throw new BadRequestError('Соглашение с перевозчиком не найдено')
  // if (!carrierAgreement.customer)
  //   throw new BadRequestError('В соглашении с ТК заказчик не определен')

  // const customerCarrier = await CarrierRepository.getById(
  //   carrierAgreement.customer
  // )
  // if (!customerCarrier) throw new BadRequestError('Заказчик не найден')

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
      date: invoice.sendDate,
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
