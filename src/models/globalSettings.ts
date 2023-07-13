// @ts-nocheck
import pkg from 'mongoose'
const { Schema, model } = pkg

const fineCategory = {
  text: { type: String, required: true },
  value: { type: String, required: true, unique: true },
  description: String,
  order: { type: Number, default: 50 },
}

const schema = new Schema({
  fineCategories: [fineCategory],
})

export default model('GlobalSettings', schema, 'globalSettings')
