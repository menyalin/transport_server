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
): Promise<void> => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    next(new UnauthorizedError('Access token is missing'))
    return
  }

  if (!authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Invalid authorization header format'))
    return
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    next(new UnauthorizedError('Token is missing'))
    return
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.ACCESS_JWT_SECRET as string
    ) as JWTPayload

    const user = await UserService.findById(payload.userId)

    if (!user) {
      next(new UnauthorizedError('User not found'))
      return
    }

    const authReq = req as AuthorizedRequest
    authReq.userId = user._id.toString()
    authReq.companyId = user.directoriesProfile?.toString()

    next()
  } catch {
    next(new UnauthorizedError('Invalid token'))
  }
}
