import z from 'zod'
import { TRUCK_KINDS_ENUM } from '../../../constants/truck'

export const TruckKindsEnumSchema = z.array(z.nativeEnum(TRUCK_KINDS_ENUM))
export const LiftCapacityEnumSchema = z.array(z.number())
export const ZoneIdSchema = z.string()
export const PriceSchema = z.number()

export const TariffZoneSchema = z.object({
  distance: z.number().min(0), // предположим, что расстояние не может быть отрицательным
  price: z.number().min(0), // цена также предполагается неотрицательной
})

const roundByHoursValues = [0.01666666, 0.5, 1, 12, 24] as const
export const RoundByHoursSchema = z.union([
  z.literal(roundByHoursValues[0]),
  z.literal(roundByHoursValues[1]),
  z.literal(roundByHoursValues[2]),
  z.literal(roundByHoursValues[3]),
  z.literal(roundByHoursValues[4]),
])

export const OrderTypeSchema = z.union([z.literal('region'), z.literal('city')])
