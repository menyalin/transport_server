import z from 'zod'
import { Types } from 'mongoose'
import {
  LOAD_DIRECTION_ENUM,
  TRUCK_KINDS_ENUM,
  TRUCK_LIFT_CAPACITY_TYPES,
} from '@/constants/truck'

export const dateOrISOStringSchema = z
  .union([z.date(), z.string().datetime({ offset: true })])
  .transform((val) => {
    if (val instanceof Date) return val
    const parsedDate = new Date(val)
    return parsedDate
  })

export const TruckKindsEnumSchema = z.nativeEnum(TRUCK_KINDS_ENUM)
export const LoadDirectonEnumSchema = z.nativeEnum(LOAD_DIRECTION_ENUM)

export const LiftCapacityEnumSchema = z.union([
  z.literal(TRUCK_LIFT_CAPACITY_TYPES[0]),
  z.literal(TRUCK_LIFT_CAPACITY_TYPES[1]),
  z.literal(TRUCK_LIFT_CAPACITY_TYPES[2]),
  z.literal(TRUCK_LIFT_CAPACITY_TYPES[3]),
  z.literal(TRUCK_LIFT_CAPACITY_TYPES[4]),
])

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
