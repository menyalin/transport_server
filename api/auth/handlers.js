const { User } = require('../../models')
const UserService = require('../../services/user')

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const tmpUser = await User.findOne({ email })
    if (!!tmpUser && (await tmpUser.isCorrectPassword(password))) {
      res.status(201).json({ token: await tmpUser.createToken() })
    } else res.status(404).json({ message: 'user not found' })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

exports.registration = async (req, res) => {
  try {
    const newUser = await User.create(req.body)
    res.status(201).json({
      token: await newUser.createToken()
    })
  } catch (e) {
    let status = 500
    if (e.code === 11000) status = 406
    res.status(status).json({ message: e.message })
  }
}

exports.getMe = async (req, res) => {
  try {
    const user = await UserService.findById(req.userId)
    res.status(200).json({ data: user })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}
