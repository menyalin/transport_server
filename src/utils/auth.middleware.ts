import jwt from 'jsonwebtoken'
import { UserService } from '../services'
import { UnauthorizedError } from '../helpers/errors'
import { NextFunction, Request, Response } from 'express'
import { AuthorizedRequest } from '@/controllers/interfaces'

interface JWTPayload {
  userId: string
}

export const jwtAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1]
    try {
      const payload = jwt.verify(
        token,
        process.env.ACCESS_JWT_SECRET || 'secret'
      ) as JWTPayload
      const user = await UserService.findById(payload.userId)

      if (user === null) next(new UnauthorizedError('invalid userId'))
      if (!user?.directoriesProfile)
        next(new UnauthorizedError('company profile is undefined'))
      else {
        const authReq = req as AuthorizedRequest
        authReq.userId = user._id.toString()
        authReq.companyId = user.directoriesProfile?.toString()
        next()
      }
    } catch (e) {
      next(new UnauthorizedError('invalid token'))
    }
  } else {
    next(new UnauthorizedError('access token is missing'))
  }
}
