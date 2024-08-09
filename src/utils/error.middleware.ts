import { Response } from 'express'

interface CustomError extends Error {
  statusCode: number
}

const errorMiddleware = async (err: CustomError, res: Response) => {
  if (err.hasOwnProperty('statusCode')) {
    return res.status(err.statusCode).json(err.message)
  } else {
    return res.status(500).json(err.message)
  }
}

export default errorMiddleware
