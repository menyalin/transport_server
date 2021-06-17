const { Schema, model, Types } = require('mongoose')

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
        enum: ['admin', 'manager', 'dispatsher']
      }
    ],
    position: {
      type: String
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
    }
  },
  { timestamps: true }
)

module.exports = model('Company', companySchema, 'companies')
