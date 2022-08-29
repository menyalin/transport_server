import { User } from '../models/index.js'
import { TokenService } from '../services/index.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  // secure: true ,
}

class AuthController {
  async login(req, res) {
    try {
      const { refreshToken } = req.cookies
      await TokenService.delete(refreshToken)
      const { email, password } = req.body
      const tmpUser = await User.findOne({ email })
      if (!!tmpUser && (await tmpUser.isCorrectPassword(password))) {
        const { accessToken, refreshToken } = await TokenService.generate({
          userId: tmpUser._id.toString(),
          userAgent: req.headers['user-agent'],
          ip: req.ip,
        })

        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
        // todo: Удалить генерацию token, должен быть только accessToken
        
        res
          .status(201)
          .json({ token: await tmpUser.createToken(), accessToken })
      } else res.status(404).json({ message: 'user not found' })
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}

export default new AuthController()
