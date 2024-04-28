import z from 'zod'

export const dateOrISOStringSchema = z
  .union([z.date(), z.string().datetime({ offset: true })])
  .transform((val) => {
    if (val instanceof Date) return val
    const parsedDate = new Date(val)
    return parsedDate
  })
