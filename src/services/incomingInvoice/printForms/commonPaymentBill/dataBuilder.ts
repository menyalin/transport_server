import { BadRequestError } from '@/helpers/errors'
import { ICommonPaymentBillData } from './interfaces'
import {
  CarrierAgreementRepository,
  CarrierRepository,
  IncomingInvoiceRepository,
  OrderRepository,
} from '@/repositories'
import { ICommonDocMainTableRowProps } from '@/shared/printForms/interfaces'
import { commonDocMainTableRowBuilder } from '@/shared/printForms/fragments'

export const commonPaymentBillDataBuilder = async (
  invoiceId: string
): Promise<ICommonPaymentBillData> => {
  if (!invoiceId) throw new BadRequestError('invoiceId is missing')
  const invoice = await IncomingInvoiceRepository.getById(invoiceId)
  if (!invoice) throw new BadRequestError('requested invoice not found')

  const executorCarrier = await CarrierRepository.getById(invoice.carrier)
  if (!executorCarrier) throw new BadRequestError('Исполнитель не определен')
  if (!executorCarrier.companyInfo)
    throw new BadRequestError(
      'У исполнителя не заполнена общая информация о компании'
    )
  if (!executorCarrier.bankAccountInfo)
    throw new BadRequestError(
      'У исполнителя не заполнена информация о банковских реквизитах'
    )

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
    ordersData.push(commonDocMainTableRowBuilder(data, orderInInvoice.total))
  }

  return {
    titleData: {
      docName: 'Счет',
      number: invoice.number,
      date: invoice.date,
    },

    headerTable: {
      executorTitle: 'Поставщик (Исполнитель)',
      executor: executorCarrier.companyInfo?.getFullDataString() ?? '',
      customerTitle: 'Покупатель (Заказчик)',
      customer: customerCarrier.companyInfo?.getFullDataString() ?? '',
      basis: carrierAgreement.actBasis || 'Основной договор',
    },
    mainTableData: {
      mainColumnTitle: 'Товары (работы, услуги)',
      rows: ordersData,
    },
    resultTable: {
      priceWithVat: invoice?.priceWithVat ?? 0,
      priceWOVat: invoice?.priceWOVat ?? 0,
      count: invoice?.ordersCount ?? 0,
      vatRate: carrierAgreement?.vatRate ?? 0,
      showTotalToPay: true,
      serviceTitle: 'Всего наименований',
    },
    description: carrierAgreement.paymentBillDescription || '',

    signatories: {
      accountantName:
        executorCarrier.companyInfo?.accountant?.name || 'Не указан',
      directorName: executorCarrier.companyInfo?.director?.name || 'Не указан',
    },
    bankInfoTable: {
      bankInfo: executorCarrier.bankAccountInfo,
      companyInfo: executorCarrier.companyInfo,
    },
  }
}
