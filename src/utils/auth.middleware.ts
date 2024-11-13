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
  // Указали void вместо возвращаемого значения
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1]
    try {
      const payload = jwt.verify(
        token,
        process.env.ACCESS_JWT_SECRET as string
      ) as JWTPayload

      const user = await UserService.findById(payload.userId)

      if (!user) {
        res.status(401).send('Unauthorized') // Убрали return, т.к. res.send завершит выполнение
        return
      }

      const authReq = req as AuthorizedRequest
      authReq.userId = user._id.toString()
      authReq.companyId = user.directoriesProfile?.toString()

      next()
    } catch (e) {
      next(new UnauthorizedError('Invalid token'))
    }
  } else {
    next(new UnauthorizedError('Access token is missing'))
  }
}
