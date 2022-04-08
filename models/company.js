import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const employeeSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
    },
    roles: [
      {
        type: String,
        required: true,
      },
    ],
    position: {
      type: String,
    },
    tasks: [{ type: Types.ObjectId, ref: 'Task' }],
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const companySchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    fullName: {
      type: String,
    },
    address: {
      type: String,
    },
    settings: {
      truckKinds: [String],
      defaultTruckKind: String,
      liftCapacityTypes: [Number],
      defaultLiftCapacity: Number,
      loadDirections: [String],
      defaultLoadDirection: String,
    },
    staff: [employeeSchema],
    inn: {
      type: String,
      unique: true,
      lowerCase: true,
    },
    hasOwnDirectories: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

export default model('Company', companySchema, 'companies')
