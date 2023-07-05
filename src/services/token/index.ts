// @ts-nocheck
import jwt from 'jsonwebtoken'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { Token } from '../../models/index.js'
import { BadRequestError, UnauthorizedError } from '../../helpers/errors.js'

class TokenService {
  _createToken(userId, secret = 'secret', lifetime = '30d') {
    return jwt.sign({ userId }, secret, { expiresIn: lifetime })
  }

  async generate(userId, req) {
    const accessToken = this._createToken(
      userId,
      process.env.ACCESS_JWT_SECRET,
      process.env.ACCESS_TOKEN_LIFETIME,
    )

    const refreshToken = uuidv4()

    await Token.create({
      userId,
      token: refreshToken,
      userAgent: req?.headers['user-agent'] || '',
      ip: req.ip,
      expireAt: dayjs().add(15, 'd'),
    })

    return { accessToken, refreshToken }
  }

  async refresh(token) {
    const existedToken = await Token.findOne({ token: token })

    if (!existedToken) {
      throw new UnauthorizedError('bad refresh token')
    }

    const accessToken = this._createToken(
      existedToken.userId.toString(),
      process.env.ACCESS_JWT_SECRET,
      process.env.ACCESS_TOKEN_LIFETIME,
    )

    const refreshToken = uuidv4()

    existedToken.token = refreshToken
    existedToken.expireAt = dayjs().add(15, 'd')
    await existedToken.save()
    return { accessToken, refreshToken }
  }

  async delete(token) {
    if (!token) return null
    await Token.deleteOne({ token })
    return null
  }

  async deleteAllUserTokens(userId) {
    if (!userId) throw new BadRequestError('no user id')
    await Token.deleteMany({ userId })
    return null
  }
}


export default new TokenService()
