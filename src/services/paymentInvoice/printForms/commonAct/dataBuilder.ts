import { BadRequestError } from '@/helpers/errors'
import {
  AgreementRepository,
  CarrierRepository,
  OrderRepository,
  PartnerRepository,
  PaymentInvoiceRepository,
} from '@/repositories'

import { mainTableRowBuilder } from './mainTableRowsBuilder'
import { ICommonDocMainTableRowProps } from '@/shared/printForms/interfaces'
import { ICommonActData } from '@/shared/printForms'

export const paymentInvoiceDataBuilder = async (
  invoiceId: string
): Promise<ICommonActData> => {
  const invoice = await PaymentInvoiceRepository.getInvoiceById(invoiceId)
  const { items: orders } =
    await PaymentInvoiceRepository.getInvoiceOrders(invoiceId)
  if (!invoice) throw new BadRequestError('Invoice not found')
  if (!orders || !orders?.length) throw new BadRequestError('Orders not found')
  invoice.setOrders(orders)

  let orderRows: ICommonDocMainTableRowProps[] = []
  const customer = await PartnerRepository.getById(invoice.clientId)
  if (!customer) throw new BadRequestError('Заказчик не найден')

  const clientAgreement = await AgreementRepository.getById(invoice.agreementId)
  if (!clientAgreement)
    throw new BadRequestError('Cоглашение с клиентом не найдено')
  if (!clientAgreement?.executor)
    throw new BadRequestError(
      'В соглашении с клиентом не указан основной исполнитель'
    )

  for (const orderInInvoice of orders) {
    const orderData = await OrderRepository.getFullOrderDataDTO(
      orderInInvoice.orderId.toString()
    )

    orderData.note =
      orderInInvoice.itemType === 'paymentPart' ? orderInInvoice.note : ''
    const row = mainTableRowBuilder(
      orderData,
      orderInInvoice.savedTotal || { price: 0, priceWOVat: 0 }
    )
    orderRows = [...orderRows, row]
  }
  const executorCarrier = await CarrierRepository.getById(
    clientAgreement.executor
  )
  if (!executorCarrier) throw new BadRequestError('Исполнитель не определен')

  return {
    signatories: {
      customerCompanyName:
        customer.companyInfo?.fullName ||
        'Укажите полное наименование партнера в блоке общей информации',
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
      customer: customer.companyInfo?.getFullDataString() ?? '',
      basis: clientAgreement.actBasis || 'Основной договор',
    },
    mainTable: {
      rows: orderRows,
      mainColumnTitle: 'Наименование работ, услуг',
    },
    resultTable: {
      priceWithVat: invoice?.priceWithVat ?? 0,
      priceWOVat: invoice?.priceWOVat ?? 0,

      count: invoice.ordersCount ?? 0,
      vatRate: invoice.vatRate,
      showTotalToPay: false,
      serviceTitle: 'Всего оказано услуг',
    },
    description:
      clientAgreement.actDescription ||
      'Вышеперечисленные услуги выполнены полностью и в срок. Заказчик претензий по объему, качеству и срокам оказания услуг не имеет.',
  }
}
