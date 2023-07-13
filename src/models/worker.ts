// @ts-nocheck
import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    name: String,
    fullName: String,
    position: String,
    note: String,
    company: { type: Types.ObjectId, ref: 'Company' },
    isActive: { type: Boolean, default: true },
    user: { type: Types.ObjectId, ref: 'User' },
    employmentDate: Date, // дата приема на работу
    dismissalDate: Date, // дата увольнения
    roles: [String],
    pending: { type: Boolean, default: false },
    accepted: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default model('Worker', schema, 'workers')
