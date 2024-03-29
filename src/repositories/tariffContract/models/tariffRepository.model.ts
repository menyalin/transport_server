import { TariffContract } from '@/domain/tariffContract'
import { Schema, model } from 'mongoose'

const schema = new Schema(TariffContract.dbSchema, {
  timestamps: true,
})

export const TariffContractModel = model<TariffContract>(
  'TariffContract',
  schema,
  'tariffContracts'
)
