import { z } from 'zod'
import { Types } from 'mongoose'
import { objectIdSchema } from '@/shared/validationSchemes'
import { BankAccountInfo } from '../bankAccountInfo'
import { CompanyInfo } from '../companyInfo'
import { ContactInfo } from '../сontactInfo'

export class Carrier {
  name: string
  company: string
  bankAccountInfo?: BankAccountInfo
  companyInfo?: CompanyInfo
  contacts?: ContactInfo[]
  outsource: boolean
  isActive: boolean

  constructor(props: unknown) {
    const p = Carrier.validationSchema.parse(props)
    this.name = p.name
    this.company = p.company.toString()
    this.bankAccountInfo = p.bankAccountInfo
      ? new BankAccountInfo(p.bankAccountInfo)
      : undefined
    this.companyInfo = p.companyInfo
      ? new CompanyInfo(p.companyInfo)
      : undefined
    this.contacts = p.contacts
    this.outsource = p.outsource
    this.isActive = p.isActive
  }

  static get validationSchema() {
    return z.object({
      name: z.string(),
      company: objectIdSchema,
      companyInfo: CompanyInfo.validationSchema.optional(),
      bankAccountInfo: BankAccountInfo.validationSchema.optional(),
      contacts: z.array(ContactInfo.validationSchema).optional(),
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
      companyInfo: CompanyInfo.dbSchema,
      bankAccountInfo: BankAccountInfo.dbSchema,
      contacts: [ContactInfo.dbSchema],
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
