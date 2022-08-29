import jwt from 'jsonwebtoken'
import dayjs from 'dayjs'
import { Token } from '../../models/index.js'

class TokenService {
  _createToken(userId, secret = 'secret', lifetime) {
    return jwt.sign(
      { userId },
      secret,
      lifetime ? { expiresIn: lifetime } : {},
    )
  }

  async generate({ userId, userAgent, userOS }) {
    const accessToken = this._createToken(
      userId,
      process.env.ACCESS_JWT_SECRET,
      process.env.ACCESS_TOKEN_LIFETIME,
    )
    const refreshToken = this._createToken(
      userId,
      process.env.REFRESH_JWT_SECRET,
    )
    await Token.create({
      userId,
      token: refreshToken,
      userAgent,
      userOS,
      expireAt: dayjs().add(15, 'd'),
    })
    return {
      accessToken,
      refreshToken,
    }
  }

  async refresh() {}

  async delete(token) {
    if (!token) return null
    await Token.deleteOne({ token })
    return null
  }
}
export default new TokenService()
