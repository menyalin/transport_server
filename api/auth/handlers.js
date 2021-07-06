import { User } from '../../models/index.js'
import { UserService } from '../../services/index.js'

export const login = async (req, res) => {
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

export const registration = async (req, res) => {
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

export const getMe = async (req, res) => {
  try {
    const user = await UserService.getUserData(req.userId)
    res.status(200).json(user)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const configProfile = async (req, res) => {
  try {
    await UserService.configProfile(req.userId, req.body)
    res.status(200).json('ok')
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

//
