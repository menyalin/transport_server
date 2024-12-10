import { Carrier } from '@/domain/carrier/carrier'
import pkg from 'mongoose'
const { Schema, model } = pkg

const schema = new Schema(Carrier.dbSchema, { timestamps: true })

export default model<Carrier>('TkName', schema, 'tknames')
