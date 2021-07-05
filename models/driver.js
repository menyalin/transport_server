/* eslint-disable no-unused-vars */
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const driverSchema = new Schema(
  {
    name: {
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
