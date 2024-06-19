import z from 'zod'

export type OrderType = 'region' | 'city'
export const OrderTypeSchema = z.union([z.literal('region'), z.literal('city')])
