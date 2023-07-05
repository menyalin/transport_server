import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const taskSchema = new Schema(
  {
    isActive: {
      type: Boolean,
      default: true
    },
    initiator: {
      type: Types.ObjectId,
      ref: 'User'
    },
    executor: {
      type: Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['addEmployee']
    },
    room: {
      type: String
    },
    title: {
      type: String
    },
    content: {
      type: String
    }
  },
  { timestamps: true }
)

export default model('Task', taskSchema, 'tasks')
