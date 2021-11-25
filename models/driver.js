/* eslint-disable no-unused-vars */
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const medBook = {
  number: String,
  issueDate: Date,
  certifiedBeforeDate: Date,
  annualCommisionDate: Date,
  note: String
}

const driverSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    surname: {
      type: String,
      required: true
    },
    patronymic: {
      type: String
    },
    tkName: {
      type: Types.ObjectId,
      ref: 'TkName',
      required: true
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
    medBook,
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
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

driverSchema.virtual('fullName').get(function () {
  if (this.patronymic)
    return this.surname + ' ' + this.name + ' ' + this.patronymic
  else return this.surname + ' ' + this.name
})

export const Driver = model('Driver', driverSchema, 'drivers')
