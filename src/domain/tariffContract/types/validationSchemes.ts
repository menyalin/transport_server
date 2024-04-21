import z from 'zod'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'
import { objectIdSchema } from '@/utils/objectIdSchema'

export const TruckKindsEnumSchema = z.array(z.nativeEnum(TRUCK_KINDS_ENUM))
export const LiftCapacityEnumSchema = z.array(z.number())
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
