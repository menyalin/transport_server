import pkg from 'mongoose'
const { Schema, model } = pkg
import { Tariff as TariffDomain } from '../domain/tariff/tariff.domain'

const schema = new Schema(TariffDomain.dbSchema, {
  timestamps: true,
})

export default model('Tariff', schema, 'tariffs')
