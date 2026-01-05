import { Types } from 'mongoose'
import { OrderPickedForInvoiceDTOProps } from '../../interfaces'
const fakeObjectd = new Types.ObjectId()

const emptyOrderData: OrderPickedForInvoiceDTOProps = {
  _id: '1',
  agreementVatRate: 20,
  paymentPartsSum: 0,
  company: fakeObjectd,
  confirmedCrew: {
    driver: fakeObjectd,
    outsourceAgreement: null,
    tkName: fakeObjectd,
    trailer: null,
    truck: fakeObjectd,
  },
  orderId: fakeObjectd,
  itemType: 'order',
  plannedDate: new Date('2024-01-01'),
  route: [],
  client: '1',
  state: { status: 'inProgress' },
  reqTransport: {},
  paymentToDriver: 0,
  usePriceWithVat: true,
  totalByTypes: {
    base: { price: 0, priceWOVat: 0, sumVat: 0 },
  },
  total: { price: 0, priceWOVat: 0 },
}

export const orderWithotPrices: OrderPickedForInvoiceDTOProps = {
  ...emptyOrderData,
}
