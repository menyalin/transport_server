import z from 'zod'
import { Types } from 'mongoose'
import { LOAD_DIRECTION_ENUM, TRUCK_KINDS_ENUM } from '@/constants/truck'
import { IdleTimeRoundingIntervalEnum } from '@/constants/tariff'

export const dateOrISOStringSchema = z
  .union([z.date(), z.string()])
  .transform((val) => {
    if (val instanceof Date) return val
    const parsedDate = new Date(val)
    return parsedDate
  })

export const TruckKindsEnumSchema = z.enum(TRUCK_KINDS_ENUM)
export const LoadDirectonEnumSchema = z.enum(LOAD_DIRECTION_ENUM)

export const LiftCapacityEnumSchema = z.number().default(20)

const stringSchema = z
  .string()
  .refine((value) => Types.ObjectId.isValid(value), {
    message: 'Invalid string of ObjectId', // Сообщение об ошибке в случае невалидного значения
  })

const objectSchema = z
  .instanceof(Types.ObjectId)
  .refine((value) => value && value instanceof Types.ObjectId, {
    message: 'Invalid object of ObjectId',
  })

export const objectIdSchema = z.union([stringSchema, objectSchema])

export const idleTimeRoundingIntervalSchema = z.enum(
  IdleTimeRoundingIntervalEnum
)
