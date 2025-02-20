import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const transportSchema = new Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  truck: {
    type: Types.ObjectId,
    ref: 'Truck',
  },
  trailer: {
    type: Types.ObjectId,
    ref: 'Truck',
  },
  note: String,
})

const schema = new Schema(
  {
    startDate: { type: Date, required: true },
    tkName: { type: Types.ObjectId, ref: 'TkName' },
    onlyCarrierItems: { type: Boolean, default: true },
    transport: [transportSchema],
    driver: { type: Types.ObjectId, ref: 'Driver' },
    endDate: { type: Date },
    manager: { type: Types.ObjectId, ref: 'User' },
    note: { type: String },
    company: { type: Types.ObjectId, ref: 'Company' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default model('Crew', schema, 'crews')
