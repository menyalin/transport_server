import { z } from 'zod'
import { Types } from 'mongoose'
import { objectIdSchema } from '@/shared/validationSchemes'
import { BankAccountInfo } from '../bankAccountInfo'
import { CompanyInfo } from '../companyInfo'
import { ContactInfo } from '../сontactInfo'
import { ICarreierPFData } from './interfaces'
import { AllowedCarrierAgreement } from './allowedCarrierAgreement'

export class Carrier {
  _id?: string
  name: string
  company: string
  agreement: string | null
  agreements: AllowedCarrierAgreement[]
  bankAccountInfo?: BankAccountInfo
  companyInfo?: CompanyInfo
  contacts?: ContactInfo[]
  outsource: boolean
  isActive: boolean
  version: number = 0

  constructor(props: unknown) {
    const p = Carrier.validationSchema.parse(props)
    this._id = p._id ? p._id.toString() : undefined
    this.agreements = p.agreements
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
    this.agreement = p.agreement?.toString() ?? null
    this.version = p.version ?? 0
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
  incVersion() {
    this.version += 1
  }
  static get validationSchema() {
    return z.object({
      _id: objectIdSchema.optional(),
      name: z.string(),
      company: objectIdSchema,
      companyInfo: CompanyInfo.validationSchema.optional(),
      bankAccountInfo: BankAccountInfo.validationSchema.optional().nullable(),
      contacts: z.array(ContactInfo.validationSchema).optional().nullable(),
      outsource: z.boolean().default(false),
      isActive: z.boolean().default(true),
      version: z.number().optional().nullable().default(0),
      agreement: objectIdSchema.optional().nullable().default(null),
      agreements: z
        .array(AllowedCarrierAgreement.validationSchema)
        .default([])
        .transform((v) =>
          v ? v.map((i) => new AllowedCarrierAgreement(i)) : []
        ),
    })
  }

  static get dbSchema() {
    return {
      name: String,
      company: {
        type: Types.ObjectId,
        ref: 'Company',
      },
      agreement: { type: Types.ObjectId },
      agreements: [AllowedCarrierAgreement.dbSchema],
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
      version: { type: Number, default: 0 },
    }
  }
}
