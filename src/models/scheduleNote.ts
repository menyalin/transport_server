// @ts-nocheck
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    truck: {
      type: Types.ObjectId,
      ref: 'Truck',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    note: String,
    startPositionDate: {
      type: Date,
      required: true,
    },
    company: {
      type: Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    priority: {
      type: String,
      default: 'low',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

export default model('ScheduleNote', schema, 'scheduleNotes ')
