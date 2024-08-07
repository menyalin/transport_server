import pkg from 'mongoose'
import bcrypt from 'bcryptjs'
const { Schema, model, Types } = pkg

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    name: String,
    openForSearch: { type: Boolean, default: true },
    emailConfirmed: { type: Boolean, default: false },
    emailConfirmationToken: { type: String, default: null },
    restorePasswordToken: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    directoriesProfile: { type: Types.ObjectId },
  },
  { timestamps: true }
)

userSchema.methods.isCorrectPassword = async function (pass: any) {
  const res = await bcrypt.compare(pass, this.password)
  return !!res || pass === this.password
}

userSchema.pre('save', function (next) {
  const tmpUser = this
  if (this.isModified('password')) {
    bcrypt.hash(tmpUser.password, 10, (_: any, hash: string) => {
      tmpUser.password = hash
      next()
    })
  } else {
    next()
  }
})

export default model('User', userSchema, 'users')
