// @ts-nocheck
/* eslint-disable no-unused-vars */
import additionalNotification from './_additionalNotification'
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const medBook = {
  number: String,
  issueDate: Date,
  certifiedBeforeDate: Date,
  annualCommisionDate: Date,
  note: String,
}

const driverSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    patronymic: String,
    tkName: { type: Types.ObjectId, ref: 'TkName', required: true },
    additionalNotifications: [additionalNotification],
    passportId: String,
    passportIssued: String,
    passportDate: Date,
    licenseId: String,
    licenseDate: Date,
    licenseCategory: String,
    driverCardId: String,
    driverCardPeriod: Date,
    hasScans: { type: Boolean, default: false },
    medBook,
    employmentDate: Date,
    dismissalDate: Date,
    recommender: String,
    birthday: Date,
    isBrigadier: { type: Boolean, default: false },
    isMechanic: { type: Boolean, default: false },
    phone: String,
    phone2: String,
    company: { type: Types.ObjectId, ref: 'Company' },
    hideInFines: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isCalcSalary: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

driverSchema.virtual('fullName').get(function () {
  if (this.patronymic)
    return this.surname + ' ' + this.name + ' ' + this.patronymic
  else return this.surname + ' ' + this.name
})

export const Driver = model('Driver', driverSchema, 'drivers')
