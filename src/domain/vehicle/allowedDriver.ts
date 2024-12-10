import { objectIdSchema } from '@/shared/validationSchemes'
import { Types } from 'mongoose'
import { z } from 'zod'

export class AllowedDriver {
  driver: string
  isPermanent: boolean

  constructor(props: unknown) {
    const p = AllowedDriver.validationSchema.parse(props)
    this.driver = p.driver.toString()
    this.isPermanent = p.isPermanent
  }

  static get validationSchema() {
    return z.object({
      driver: objectIdSchema,
      isPermanent: z
        .boolean()
        .default(false)
        .nullable()
        .transform((v) => Boolean(v)),
    })
  }
  static get dbSchema() {
    return {
      driver: {
        type: Types.ObjectId,
        ref: 'Driver',
      },
      isPermanent: {
        type: Boolean,
        default: false,
      },
    }
  }
}
