import { TotalPrice } from '@/domain/commonInterfaces'

const isNeedUpdatePrices = (
  usePriceWithVat: boolean,
  orderTotal: TotalPrice,
  savedTotal?: TotalPrice
): boolean => {
  if (!savedTotal) return false
  if (
    usePriceWithVat
      ? orderTotal.price !== savedTotal.price
      : orderTotal.priceWOVat !== savedTotal.priceWOVat
  )
    return true
  return false
}

export const utils = {
  isNeedUpdatePrices,
}
