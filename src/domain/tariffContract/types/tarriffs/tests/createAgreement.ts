import { Agreement } from '@/domain/agreement/agreement.domain'
import { Types } from 'mongoose'

export const createAgreement = (args: object): Agreement => {
  const fakeObjectId = new Types.ObjectId().toString()

  return new Agreement({
    name: 'test agreement #1',
    company: fakeObjectId,
    date: new Date('2023-01-01'),
    closed: false,
    clients: [fakeObjectId],
    vatRate: 20,
    isOutsourceAgreement: false,
    commission: 0,
    usePriceWithVAT: true,
    useCustomPrices: true,
    auctionNumRequired: false,
    calcWaitingByArrivalDateLoading: false,
    calcWaitingByArrivalDateUnloading: false,
    clientNumRequired: false,
    noWaitingPaymentForAreLateUnloading: false,
    noWaitingPaymentForAreLateLoading: false,
    priceRequired: false,
    ...args,
  })
}
