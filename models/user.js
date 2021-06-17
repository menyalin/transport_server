const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true },
    name: String
  },
  { timestamps: true }
)

userSchema.methods.createToken = async function () {
  const token = await jwt.sign(
    {
      userId: this._id
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.TOKEN_LIFETIME || '31d' }
  )
  return `Bearer ${token}`
}

userSchema.methods.isCorrectPassword = async function (pass) {
  const res = await bcrypt.compare(pass, this.password)
  return !!res
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

module.exports = model('User', userSchema, 'users')
