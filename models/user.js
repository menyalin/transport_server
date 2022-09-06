import pkg from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
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
    openForSearch: {
      type: Boolean,
      default: true,
    },
    isAdmin: { type: Boolean, default: false },
    restorePasswordToken: { type: String, default: null },
    directoriesProfile: {
      type: Types.ObjectId,
    },
  },
  { timestamps: true },
)

userSchema.methods.createToken = async function () {
  const token = await jwt.sign(
    {
      userId: this._id,
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.TOKEN_LIFETIME || '31d' },
  )
  return `Bearer ${token}`
}

userSchema.methods.isCorrectPassword = async function (pass) {
  const res = await bcrypt.compare(pass, this.password)
  return !!res || pass === this.password
}

userSchema.pre('save', function (next) {
  const tmpUser = this
  if (this.isModified('password')) {
    bcrypt.hash(tmpUser.password, 10, (_, hash) => {
      tmpUser.password = hash
      next()
    })
  } else {
    next()
  }
})

export default model('User', userSchema, 'users')
