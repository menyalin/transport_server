import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    number: { type: String, required: true },
    note: String,
    isActive: { type: Boolean, default: true },

    /*
    truck: { type: Types.ObjectId, ref: 'Truck', required: true },
    type: { type: String, enum: DOWNTIME_TYPES, required: true },
    title: { type: String, required: true },
    partner: { type: Types.ObjectId, ref: 'Partner' },
    address: { type: Types.ObjectId, ref: 'Address' },
    startPositionDate: { type: Date, required: true },
    endPositionDate: { type: Date, required: true },
    inOrderTime: { type: Boolean, default: false },
    */
  },
  { timestamps: true },
)

export default model('Fine', schema, 'fines')
