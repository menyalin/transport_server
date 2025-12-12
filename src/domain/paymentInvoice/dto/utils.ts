import { TotalPrice, PriceByType } from '@/domain/commonInterfaces'
import { ORDER_PRICE_TYPES_ENUM_VALUES } from '@/constants/priceTypes'

import {
  OrderPickedForInvoiceDTOProps,
  orderPickedForInvoiceDTOSchema,
} from '../interfaces'

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
    prePrices.find((i) => i.type === type) || { type, priceWOVat: 0, price: 0 }
  )
}

const createBasePriceByType = (
  rate: number,
  priceWOVat: number
): PriceByType => ({
  type: 'base',
  priceWOVat: priceWOVat,
  price: priceWOVat * (rate / 100 + 1),
})

const createPriceByType = (
  rate: number,
  priceByTypeWOVat: PriceByType
): PriceByType => ({
  ...priceByTypeWOVat,
  price: priceByTypeWOVat.priceWOVat * (rate / 100 + 1),
})

export const calcTotalByTypes = (
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

  let res: Record<string, PriceByType> = Object.fromEntries(
    ORDER_PRICE_TYPES_ENUM_VALUES.map((type) => [
      type,
      { type, priceWOVat: 0, price: 0 },
    ])
  )

  res.base = createBasePriceByType(agreementVatRate, 0)

  if (!prePrices?.length && !prices?.length && !finalPrices?.length) return res

  if (itemType === 'paymentPart') {
    if (!paymentParts) throw new Error('Payment part data is missing')
    res.base = createBasePriceByType(agreementVatRate, paymentParts.priceWOVat)
    return res
  }

  ORDER_PRICE_TYPES_ENUM_VALUES.forEach((type) => {
    const priceByTypeWOVat = getPriceWOVatByType(
      type,
      finalPrices,
      prices,
      prePrices
    )
    res[type] = createPriceByType(agreementVatRate, priceByTypeWOVat)
  })

  if (paymentPartsSumWOVat > 0) {
    const newPriceWOVat = res.base.priceWOVat - paymentPartsSumWOVat
    res.base = createBasePriceByType(agreementVatRate, newPriceWOVat)
  }

  return res
}

const calcTotal = (totalByTypes: Record<string, PriceByType>): TotalPrice => {
  return Object.values(totalByTypes).reduce<TotalPrice>(
    (acc, typeData) => {
      acc.price += typeData.price ?? 0
      acc.priceWOVat += typeData.priceWOVat ?? 0
      return acc
    },
    { price: 0, priceWOVat: 0 }
  )
}

export const utils = {
  isNeedUpdatePrices,
  calcTotalByTypes,
  calcTotal,
}
