import { PipelineStage } from 'mongoose'

export const orderOutsourcePriceBuilder = (
  field = '$outsourceCosts'
): PipelineStage[] => [
  {
    $addFields: {
      outsourceTotalPrice: {
        $reduce: {
          input: field,
          initialValue: { priceWithVat: 0, priceWOVat: 0 },
          in: {
            priceWithVat: { $add: ['$$value.priceWithVat', '$$this.price'] },
            priceWOVat: { $add: ['$$value.priceWOVat', '$$this.priceWOVat'] },
          },
        },
      },
    },
  },
]
