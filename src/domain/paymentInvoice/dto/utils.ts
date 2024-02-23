import { ORDER_PRICE_TYPES_ENUM_VALUES } from '../../../constants/priceTypes'
import { OrderPaymentPartPropsSchema } from '../../order/paymentPart'
import {
  OrderPickedForInvoiceDTOProps,
  PriceByType,
  TotalPrice,
  orderPickedForInvoiceDTOSchema,
} from '../interfaces'

function isNumber(value: any): value is number {
  return typeof value === 'number'
}

const isNeedUpdatePrices = (
  orderTotal: TotalPrice,
  savedTotal?: TotalPrice
): boolean => {
  if (!savedTotal) return false
  if (
    orderTotal.price !== savedTotal.price ||
    orderTotal.priceWOVat !== savedTotal.priceWOVat
  )
    return true
  return false
}

const getPriceWOVatByType = (
  type: string,
  finalPrices: PriceByType[] = [],
  prices: PriceByType[] = [],
  prePrices: PriceByType[] = []
): PriceByType => {
  return (
    finalPrices.find((i) => i.type === type) ||
    prices.find((i) => i.type === type) ||
    prePrices.find((i) => i.type === type) || { type, priceWOVat: 0 }
  )
}

const calcTotalByTypes = (
  orderDTO: OrderPickedForInvoiceDTOProps
): Record<string, PriceByType> => {
  orderPickedForInvoiceDTOSchema.parse(orderDTO)
  const {
    itemType,
    paymentParts,
    agreementVatRate,
    finalPrices,
    prices,
    prePrices,
    paymentPartsSumWOVat,
  } = orderDTO

  const priceTypes = ORDER_PRICE_TYPES_ENUM_VALUES
  let res: Record<string, PriceByType> = {
    base: { type: 'base', priceWOVat: 0, price: 0 },
  }
  if (!prePrices?.length && !prices?.length && !finalPrices?.length) return res

  if (itemType === 'paymentPart') {
    if (!paymentParts) throw new Error('payment part data is missing')

    priceTypes.forEach((type) => {
      res[type] = { priceWOVat: 0, price: 0 }
    })
    res.base = {
      priceWOVat: paymentParts.priceWOVat,
      price: paymentParts.priceWOVat * (agreementVatRate / 100 + 1),
    }
    return res
  }

  priceTypes.forEach((type) => {
    const priceByTypeWOVat = getPriceWOVatByType(
      type,
      finalPrices,
      prices,
      prePrices
    )
    res[type] = {
      ...priceByTypeWOVat,
      price: priceByTypeWOVat.priceWOVat * (agreementVatRate / 100 + 1),
    }
  })

  if (paymentPartsSumWOVat > 0) {
    const newPriceWOVat = res.base.priceWOVat - paymentPartsSumWOVat
    res.base = {
      ...res.base,
      priceWOVat: newPriceWOVat,
      price: newPriceWOVat * (agreementVatRate / 100 + 1),
    }
  }
  return res
}

const calcTotal = (totalByTypes: Record<string, PriceByType>): TotalPrice => {
  let res: TotalPrice = {
    price: 0,
    priceWOVat: 0,
  }

  const keys = Object.keys(totalByTypes)

  keys.forEach((key) => {
    const typeData = totalByTypes[key]
    const tmpPrice: number = isNumber(typeData?.price) ? typeData.price : 0
    const priceWOVat: number = isNumber(typeData?.priceWOVat)
      ? typeData.priceWOVat
      : 0

    res.price += tmpPrice
    res.priceWOVat += priceWOVat
  })
  return res
}

export const utils = {
  isNeedUpdatePrices,
  calcTotalByTypes,
  calcTotal,
}
