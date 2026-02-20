import { ORDER_PRICE_TYPES_ENUM } from '@/constants/priceTypes'
import { PipelineStage } from 'mongoose'

const getTotalPrice = (
  priceTypes: ORDER_PRICE_TYPES_ENUM[],
  withVat: boolean = true
) => ({
  $add: priceTypes.map((type) => ({
    $ifNull: [`$${type}.${withVat ? 'price' : 'priceWOVat'}`, 0],
  })),
})

const addPriceTypeFields = () => {
  let res = {}
  Object.values(ORDER_PRICE_TYPES_ENUM).forEach((type) => {
    res = Object.assign(res, {
      [type]: {
        $ifNull: [
          '$finalPrices.' + type,
          '$prices.' + type,
          '$prePrices.' + type,
        ],
      },
    })
  })
  return { $addFields: { ...res } }
}

const addPaymentInvoiceInfo = (): PipelineStage[] => {
  return [
    {
      $lookup: {
        from: 'ordersInPaymentInvoices',
        localField: '_id',
        foreignField: 'order',
        as: 'invoiceInfo',
      },
    },
    {
      $addFields: {
        invoiceInfo: { $first: '$invoiceInfo' },
      },
    },
  ]
}

export const addTotalPriceFields = () => {
  const calculatedTotalWithVat = getTotalPrice(
    Object.values(ORDER_PRICE_TYPES_ENUM),
    true
  )
  const calculatedTotalWOVat = getTotalPrice(
    Object.values(ORDER_PRICE_TYPES_ENUM),
    false
  )

  return [
    addPriceTypeFields(),
    ...addPaymentInvoiceInfo(),
    {
      $addFields: {
        totalWithVat: {
          $cond: {
            if: { $ifNull: ['$invoiceInfo.total.price', false] },
            then: '$invoiceInfo.total.price',
            else: calculatedTotalWithVat,
          },
        },
        totalWOVat: {
          $cond: {
            if: { $ifNull: ['$invoiceInfo.total.priceWOVat', false] },
            then: '$invoiceInfo.total.priceWOVat',
            else: calculatedTotalWOVat,
          },
        },
      },
    },
  ]
}
