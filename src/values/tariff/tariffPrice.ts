import { CURRENCY } from '../../constants/currency'

export interface ITariffPriceDTO {
  price: number
  withVat: boolean
  currency?: string
}

export class TariffPrice {
  price: number
  withVat: boolean
  currency: string = CURRENCY.rub

  constructor(p: ITariffPriceDTO) {
    this.price = p.price
    this.withVat = p.withVat
    if (p.currency) this.currency = p.currency
  }
  static getDbSchema() {
    return {
      price: { type: Number, default: 0 },
      withVat: { type: Boolean, default: false },
      currency: { type: String, default: CURRENCY.rub },
    }
  }
}
