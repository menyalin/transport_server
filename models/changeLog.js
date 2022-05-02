import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const changeLogSchema = new Schema({
  docId: { type: Types.ObjectId },
  company: { type: Types.ObjectId, ref: 'Company' },
  user: { type: Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  coll: String,
  opType: String,
  body: String,
})

export default model('ChangeLog', changeLogSchema, 'changeLog')
