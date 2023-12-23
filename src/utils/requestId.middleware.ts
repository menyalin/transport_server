import { model, Schema } from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import { MongoServerError } from 'mongodb'

const UUIDSchema = new Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    index: { expireAfterSeconds: 24 * 60 * 60 }, // 24 hours
  },
})
const UUIDModel = model('UUID', UUIDSchema)

export default async (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['request-id']
  if (!requestId) return next()

  try {
    await UUIDModel.create({ uuid: requestId })
    next()
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return res.status(400).send('This Request ID already exists')
    }
    next(error)
  }
}
