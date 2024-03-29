import { Types } from 'mongoose'
import { z } from 'zod'

const stringSchema = z
  .string()
  .refine((value) => Types.ObjectId.isValid(value), {
    message: 'Invalid sting of ObjectId', // Сообщение об ошибке в случае невалидного значения
  })

const objectSchema = z
  .instanceof(Types.ObjectId)
  .refine((value) => value && value instanceof Types.ObjectId, {
    message: 'Invalid object of ObjectId',
  })

export const objectIdSchema = z.union([stringSchema, objectSchema])
