/* eslint-disable no-unused-vars */
import pkg from 'mongoose'

const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    type: String,
    user: {
      type: Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
)

export const UserActivity = model('UserActivity', schema, 'user_activity')
