import { Schema, model } from 'mongoose'

const changeLogSchema = new Schema({
  docId: { type: Schema.Types.ObjectId },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  coll: String,
  opType: String,
  body: { type: Schema.Types.Mixed },
})

export default model('ChangeLog', changeLogSchema, 'changeLog')
