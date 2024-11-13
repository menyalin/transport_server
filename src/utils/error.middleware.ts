import { Request, Response, ErrorRequestHandler, NextFunction } from 'express'

interface CustomError extends Error {
  statusCode: number
}

export const errorMiddleware: ErrorRequestHandler = async (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (err.hasOwnProperty('statusCode'))
    res.status(err.statusCode).json(err.message)
  else res.status(500).json(err.message)
}
