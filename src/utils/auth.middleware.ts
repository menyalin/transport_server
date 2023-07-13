// @ts-nocheck
import jwt from 'jsonwebtoken'
import { UserService } from '../services'
import { UnauthorizedError } from '../helpers/errors'

export const jwtAuth = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1]
    try {
      const payload = jwt.verify(
        token,
        process.env.ACCESS_JWT_SECRET || 'secret'
      )
      const user = await UserService.findById(payload.userId)
      if (!user) next(new UnauthorizedError('invalid userId'))
      req.userId = user._id.toString()
      req.companyId = user.directoriesProfile?.toString()
      next()
    } catch (e) {
      next(new UnauthorizedError('invalid token'))
    }
  } else {
    next(new UnauthorizedError('access token is missing'))
  }
}
