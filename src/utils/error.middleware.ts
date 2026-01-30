import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'

interface CustomError extends Error {
  statusCode: number
}

export const errorMiddleware: ErrorRequestHandler = async (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  if (Object.prototype.hasOwnProperty.call(err, 'statusCode'))
    res.status(err.statusCode).json(err.message)
  else res.status(500).json(err.message)
}
