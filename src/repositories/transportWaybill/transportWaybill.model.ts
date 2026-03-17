import { TransportWaybill } from '@/domain/transportWaybill'
import { model, Schema } from 'mongoose'

const schema = new Schema(TransportWaybill.dbSchema, {
  timestamps: true,
})

export const TransportWaybillModel = model(
  'TransportWaybill',
  schema,
  'transportWaybills'
)
