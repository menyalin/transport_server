/* eslint-disable no-unused-vars */
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const driverSchema = new Schema(
  {
    fullName: String,
    name: {
      type: String
    },
    patronymic: {
      type: String
    },
    surname: {
      type: String
    },
    tkName: {
      type: Types.ObjectId,
      ref: 'TkName'
    },
    passportId: String,
    passportIssued: String,
    passportDate: Date,
    licenseId: String,
    licenseDate: Date,
    licenseCategory: String,
    driverCardId: String,
    driverCardPeriod: Date,
    hasScans: {
      type: Boolean,
      default: false
    },
    employmentDate: Date,
    dismissalDate: Date,
    recommender: String,
    birthday: {
      type: Date
    },
    phone: {
      type: String
    },
    phone2: {
      type: String
    },
    company: {
      type: Types.ObjectId,
      ref: 'Company'
    }
  },
  { timestamps: true }
)

export const Driver = model('Driver', driverSchema, 'drivers')
