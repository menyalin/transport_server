// @ts-nocheck
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    isActive: { type: Boolean, default: true },
    note: String,
    date: Date,
    number: { type: String, required: true },
    category: { type: String },
    violationDate: Date,
    violation: { type: String },
    truck: { type: Types.ObjectId, ref: 'Truck', required: true },
    driver: { type: Types.ObjectId, ref: 'Driver' },
    totalSum: Number,
    discountedSum: Number,
    expiryDateOfDiscount: Date,
    address: String,
    paymentDate: { type: Date, default: null },
    paymentSum: Number,
    isPaydByDriver: { type: Boolean, default: false },
    payingByWorker: { type: Types.ObjectId, ref: 'Worker' },
    isCulpritDriver: { type: Boolean, default: false },
    kX: Number,
    withheldSum: Number,
  },
  { timestamps: true }
)

export default model('Fine', schema, 'fines')
