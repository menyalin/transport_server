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
import { Order } from '@/models'

export const paymentInvoiceDataBuilder = async (
  invoiceId: string
): Promise<ICommonActData> => {
  const invoice = await PaymentInvoiceRepository.getInvoiceById(invoiceId)
  if (!invoice) throw new BadRequestError('Invoice not found')
  if (!invoice?.orders) throw new BadRequestError('Orders not found')
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

  for (const orderInInvoice of invoice.orders) {
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
      date: invoice.sendDate,
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
      priceWithVat: invoice?.invoiceTotalSumWithVat ?? 0,
      priceWOVat:
        (invoice?.invoiceTotalSumWithVat ?? 0) - (invoice?.invoiceVatSum ?? 0),

      count: invoice?.orders.length ?? 0,
      // invoice?.ordersCount ?? 0,
      vatRate: clientAgreement?.vatRate ?? 0,
      showTotalToPay: false,
      serviceTitle: 'Всего оказано услуг',
    },
    description:
      clientAgreement.actDescription ||
      'Вышеперечисленные услуги выполнены полностью и в срок. Заказчик претензий по объему, качеству и срокам оказания услуг не имеет.',
  }
}
