import { OrderPickedForInvoiceDTOProps } from '../../interfaces'

const emptyOrderData: OrderPickedForInvoiceDTOProps = {
  _id: '1',
  agreementVatRate: 20,
  paymentPartsSumWOVat: 0,
  company: '1',
  confirmedCrew: {
    driver: '1',
    outsourceAgreement: null,
    tkName: '1',
    trailer: null,
    truck: '1',
  },
  orderId: '1',
  itemType: 'order',
  plannedDate: new Date('2024-01-01'),
  route: [],
}

export const orderWithotPrices: OrderPickedForInvoiceDTOProps = {
  ...emptyOrderData,
}
