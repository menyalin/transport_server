import jwt from 'jsonwebtoken'
import { UserService } from '../services'
import { NextFunction, Request, Response } from 'express'
import { AuthorizedRequest } from '@/controllers/interfaces'
import { TokenExpiredError } from 'jsonwebtoken'

interface JWTPayload {
  userId: string
}

// Отправляем 401 ответ без создания объекта ошибки, чтобы не засорять логи
const sendUnauthorized = (res: Response, message: string): void => {
  res.status(401).json({ message })
}

export const jwtAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    sendUnauthorized(res, 'Access token is missing')
    return
  }

  if (!authHeader.startsWith('Bearer ')) {
    sendUnauthorized(res, 'Invalid authorization header format')
    return
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    sendUnauthorized(res, 'Token is missing')
    return
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.ACCESS_JWT_SECRET as string
    ) as JWTPayload

    const user = await UserService.findById(payload.userId)

    if (!user) {
      sendUnauthorized(res, 'User not found')
      return
    }

    const authReq = req as AuthorizedRequest
    authReq.userId = user._id.toString()
    authReq.companyId = user.directoriesProfile?.toString()

    next()
  } catch (err) {
    // Не логируем истекшие токены - это нормальная ситуация
    const message =
      err instanceof TokenExpiredError
        ? 'Token expired'
        : 'Invalid token'
    sendUnauthorized(res, message)
  }
}
