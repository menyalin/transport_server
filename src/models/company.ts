import pkg from 'mongoose'
const { Schema, model } = pkg

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
      s3Prefix: String,
      truckKinds: [String],
      defaultTruckKind: String,
      liftCapacityTypes: [Number],
      defaultLiftCapacity: Number,
      loadDirections: [String],
      defaultLoadDirection: String,
    },
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
  { timestamps: true }
)

export default model('Company', companySchema, 'companies')
