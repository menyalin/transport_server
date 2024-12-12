import { z } from 'zod'
import { Types } from 'mongoose'
import { objectIdSchema } from '@/shared/validationSchemes'
import { BankAccountInfo } from '../bankAccountInfo'
import { CompanyInfo } from '../companyInfo'
import { ContactInfo } from '../сontactInfo'
import { ICarreierPFData } from './interfaces'

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
    this.contacts = p.contacts?.map((i) => new ContactInfo(i)) ?? undefined
    this.outsource = p.outsource
    this.isActive = p.isActive
  }

  get getPFdata(): ICarreierPFData {
    const signatoryPosition = this.companyInfo?.director?.isMainSignatory
      ? this.companyInfo.director.position
      : this.companyInfo?.signatory?.position

    const signatoryName = this.companyInfo?.director?.isMainSignatory
      ? this.companyInfo.director.name
      : this.companyInfo?.signatory?.fullName

    return {
      fullName: this.companyInfo?.fullName || this.name,
      legalAddress: this.companyInfo?.legalAddress || '',
      inn: this.companyInfo?.inn || '',
      kpp: this.companyInfo?.kpp || '',
      ogrn: this.companyInfo?.ogrn || '',
      ogrnip: this.companyInfo?.ogrnip || '',
      signatoryPosition: signatoryPosition || '',
      signatoryName: signatoryName || '',
      bankInfo: this.bankAccountInfo,
    }
  }

  static get validationSchema() {
    return z.object({
      name: z.string(),
      company: objectIdSchema,
      companyInfo: CompanyInfo.validationSchema.optional(),
      bankAccountInfo: BankAccountInfo.validationSchema.optional().nullable(),
      contacts: z.array(ContactInfo.validationSchema).optional().nullable(),
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
