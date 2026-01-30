import { Expression } from 'mongoose'

// Суммирует все price и priceWOVat из totalByTypes
export const calcTotalBuilder = (): Expression => ({
  $reduce: {
    input: { $objectToArray: '$totalByTypes' },
    initialValue: {
      price: 0,
      priceWOVat: 0,
    },
    in: {
      price: { $add: ['$$value.price', '$$this.v.price'] },
      priceWOVat: { $add: ['$$value.priceWOVat', '$$this.v.priceWOVat'] },
    },
  },
})
