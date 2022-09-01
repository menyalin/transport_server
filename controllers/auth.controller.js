import { UnauthorizedError } from '../helpers/errors.js'
import { User } from '../models/index.js'
import { TokenService, UserService } from '../services/index.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: 'Lax',
  secure: true,
}

class AuthController {
  async getMe(req, res) {
    try {
      const user = await UserService.getUserData(req.userId)
      res.status(200).json(user)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }

  async getById(req, res) {
    try {
      const user = await UserService.findById(req.params.id)
      res.status(200).json(user)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async configProfile(req, res) {
    try {
      await UserService.configProfile(req.userId, req.body)
      res.status(200).json('ok')
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async login(req, res) {
    try {
      await TokenService.delete(req.cookies.refreshToken)
      const { email, password } = req.body
      const tmpUser = await User.findOne({ email })
      if (!!tmpUser && (await tmpUser.isCorrectPassword(password))) {
        const { accessToken, refreshToken } = await TokenService.generate(
          tmpUser._id.toString(),
          req,
        )

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

  async registration(req, res) {
    try {
      await TokenService.delete(req.cookies.refreshToken)
      const newUser = await User.create(req.body)
      const { accessToken, refreshToken } = await TokenService.generate(
        newUser._id.toString(),
        req,
      )

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
      // todo: Удалить генерацию token, должен быть только accessToken
      res.status(201).json({
        token: await newUser.createToken(),
        accessToken,
      })
    } catch (e) {
      let status = 500
      if (e.code === 11000) status = 406
      res.status(status).json({ message: e.message })
    }
  }

  async refresh(req, res) {
    try {
      if (!req.cookies.refreshToken)
        throw new UnauthorizedError('refresh token is missing')

      const { refreshToken, accessToken } = await TokenService.refresh(
        req.cookies.refreshToken,
      )
      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
      res.status(201).json({ accessToken })
    } catch (e) {
      if (e.statusCode === 401) res.clearCookie('refreshToken')
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async logout(req, res) {
    try {
      await TokenService.delete(req.cookies.refreshToken)
      res.clearCookie('refreshToken')
      res.status(200).json('ok')
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async changePassword(req, res) {
    try {
      await UserService.changePassword({ userId: req.userId, ...req.body })
      await TokenService.deleteAllUserTokens(req.userId)
      const { accessToken, refreshToken } = await TokenService.generate(
        req.userId,
        req,
      )
      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
      res.status(200).json({ accessToken })
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}
export default new AuthController()
