import z from 'zod'
import { TRUCK_LIFT_CAPACITY_TYPES } from '@/constants/truck'
import { objectIdSchema } from '@/shared/validationSchemes'

export const ZoneIdSchema = objectIdSchema
export const PriceSchema = z.number()

export const TariffZoneSchema = z.object({
  distance: z.number().min(0),
  price: z.number(),
})

const roundByHoursValues = [0.01666666, 0.5, 1, 12, 24] as const
export const RoundByHoursSchema = z.union([
  z.literal(roundByHoursValues[0]),
  z.literal(roundByHoursValues[1]),
  z.literal(roundByHoursValues[2]),
  z.literal(roundByHoursValues[3]),
  z.literal(roundByHoursValues[4]),
])

export const LiftCapacityEnumSchema = z.union([
  z.literal(TRUCK_LIFT_CAPACITY_TYPES[0]),
  z.literal(TRUCK_LIFT_CAPACITY_TYPES[1]),
  z.literal(TRUCK_LIFT_CAPACITY_TYPES[2]),
  z.literal(TRUCK_LIFT_CAPACITY_TYPES[3]),
  z.literal(TRUCK_LIFT_CAPACITY_TYPES[4]),
])
