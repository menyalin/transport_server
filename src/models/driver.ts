import pkg from 'mongoose'
import { Driver } from '@/domain/driver/driver'
const { Schema, model } = pkg

const driverSchema = new Schema(Driver.dbSchema, {
  timestamps: true,
  toJSON: { virtuals: true },
})

driverSchema.virtual('fullName').get(function () {
  if (this.patronymic)
    return this.surname + ' ' + this.name + ' ' + this.patronymic
  else return this.surname + ' ' + this.name
})

export default model<Driver>('Driver', driverSchema, 'drivers')
