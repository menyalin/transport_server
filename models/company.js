import pkg from 'mongoose'
import { USER_ROLES } from '../constants/enums.js'
const { Schema, model, Types } = pkg

const employeeSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User'
    },
    roles: [
      {
        type: String,
        required: true,
        enum: USER_ROLES
      }
    ],
    position: {
      type: String
    },
    tasks: [{ type: Types.ObjectId, ref: 'Task' }],
    isActive: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

const companySchema = new Schema(
  {
    name: {
      type: String,
      require: true
    },
    fullName: {
      type: String
    },
    address: {
      type: String
    },
    staff: [employeeSchema],
    inn: {
      type: String,
      unique: true,
      lowerCase: true
    },
    hasOwnDirectories: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

export default model('Company', companySchema, 'companies')
