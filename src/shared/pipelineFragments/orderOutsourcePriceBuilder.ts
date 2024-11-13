import { PipelineStage } from 'mongoose'

export const orderOutsourcePriceBuilder = (): PipelineStage[] => [
  {
    $addFields: {
      outsourceTotalPrice: {
        $reduce: {
          input: '$outsourceCosts',
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
