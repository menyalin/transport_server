import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    token: { type: String, unique: true, required: true },
    userAgent: String,
    ip: String,
    expireAt: { type: Date, required: true },
  },
  { timestamps: true },
)

schema.index({ expireAt: 1 }, { expireAfterSeconds: 15 })

export default model('Token', schema, 'tokens')
