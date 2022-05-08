import { ORDER_PRICE_TYPES_ENUM } from '../constants/priceTypes.js'

const MODEL = {
  type: {
    type: String,
    required: true,
  },
  priceWOVat: { type: Number },
  sumVat: { type: Number },
  price: { type: Number },
  note: String,
}

export default class PriceDTO {
  constructor({ type, priceWOVat, price, sumVat, note }) {
    this.type = type
    this.priceWOVat = priceWOVat
    this.price = price
    this.sumVat = sumVat
    this.note = note
  }

  static modelFields() {
    return MODEL
  }

  static createFromTariff({ tariff, type }) {
    if (!type || !ORDER_PRICE_TYPES_ENUM.includes(type))
      throw new Error('incorrect price type')
    if (!tariff) throw new Error('bad tariff')
    return new PriceDTO({
      type,
      priceWOVat: tariff.priceWOVat,
      price: tariff.price,
      sumVat: tariff.sumVat,
      note: tariff.note,
    })
  }

  static prepareOrderForPrePriceQuery(order) {
    return {
      company: order.company.toString(),
      date: new Date(order.route[0].plannedDate).toISOString(),
      agreement: order.client.agreement,
      truckKind: order.reqTransport.kind,
      liftCapacity: order.reqTransport.liftCapacity,
      route: order.route,
      orderType: order.analytics.type,
      prices: order.prices,
    }
  }
}
