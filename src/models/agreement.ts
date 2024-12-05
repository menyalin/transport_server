import { Schema, model } from 'mongoose'
import { Agreement } from '@/domain/agreement/agreement.domain'

const schema = new Schema(Agreement.dbSchema, { timestamps: true })

export default model<Agreement>('Agreement', schema, 'agreements')
