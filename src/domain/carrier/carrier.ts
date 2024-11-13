import { z } from 'zod'
import { Types } from 'mongoose'
import { objectIdSchema } from '@/shared/validationSchemes'
import { BankAccountInfo } from '../bankAccountInfo'

export class Carrier {
  name: string
  company: string
  bankAccountInfo?: BankAccountInfo
  outsource: boolean
  isActive: boolean

  constructor(props: unknown) {
    const p = Carrier.validationSchema.parse(props)
    this.name = p.name
    this.company = p.company.toString()
    this.bankAccountInfo = p.bankAccountInfo
    this.outsource = p.outsource
    this.isActive = p.isActive
  }

  static get validationSchema() {
    return z.object({
      name: z.string(),
      company: objectIdSchema,
      bankAccountInfo: BankAccountInfo.validationSchema.optional(),
      outsource: z.boolean().default(false),
      isActive: z.boolean().default(true),
    })
  }

  static get dbSchema() {
    return {
      name: String,
      company: {
        type: Types.ObjectId,
        ref: 'Company',
      },
      bankAccountInfo: BankAccountInfo.dbSchema,
      outsource: {
        type: Boolean,
        default: false,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    }
  }
}
