import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    isActive: { type: Boolean, default: true },
    note: String,
    date: Date,
    number: { type: String, required: true },
    truck: { type: Types.ObjectId, ref: 'Truck', required: true },
    driver: { type: Types.ObjectId, ref: 'Driver' },
    totalSum: Number,
    discountedSum: Number,
    violationDate: Date,
    address: String,
    paymentDate: Date,
    paymentSum: Number,
    culprit: { type: Types.ObjectId, ref: 'Worker' },
    kX: Number,
    withheldSum: Number,
  },
  { timestamps: true },
)

export default model('Fine', schema, 'fines')
