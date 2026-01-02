import { z } from 'zod'
import { Types } from 'mongoose'
import { objectIdSchema } from '@/shared/validationSchemes'
import { BankAccountInfo } from '../bankAccountInfo'
import { CompanyInfo } from '../companyInfo'
import { ContactInfo } from '../сontactInfo'
import { ICarreierPFData } from './interfaces'
import { VatRateInfo } from '../vatRateInfo'
import { AllowedAgreement } from '../allowedAgreement'

export class Carrier {
  _id?: string
  name: string
  company: string
  agreements: AllowedAgreement[]
  bankAccountInfo?: BankAccountInfo
  companyInfo?: CompanyInfo
  contacts?: ContactInfo[]
  outsource: boolean
  allowUseCustomerRole: boolean
  isActive: boolean
  vatRates?: VatRateInfo[] | null
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
    this.allowUseCustomerRole = p.allowUseCustomerRole ?? false
    this.isActive = p.isActive
    this.vatRates = p.vatRates
    this.version = p.version ?? 0
  }

  get getPFdata(): ICarreierPFData {
    const signatoryPosition = this.companyInfo?.director?.isMainSignatory
      ? this.companyInfo.director.position
      : this.companyInfo?.signatory?.position

    const signatoryName = this.companyInfo?.director?.isMainSignatory
      ? this.companyInfo.director.name
      : this.companyInfo?.signatory?.fullName

    const fullDataString = `${this.companyInfo?.getFullDataString()} ${this.bankAccountInfo?.getFullDataString()}`
    return {
      fullDataString,
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

  getVatRateByDate(date: Date): number | null {
    if (!this.vatRates || this.vatRates.length === 0) return null
    const vatRateInfo = this.vatRates.find(
      (vr) => +vr.startPeriod <= +date && (!vr.endPeriod || +vr.endPeriod > +date)
    )
    return vatRateInfo?.vatRate ?? null
  }

  getAgreementIdsByDate(date: Date): string[] {
    return this.agreements
      .filter(
        (aa) => +aa.startDate <= +date && (!aa.endDate || +aa.endDate >= +date)
      )
      .map((aa) => aa.agreement.toString())
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
      allowUseCustomerRole: z.boolean().optional().default(false),
      isActive: z.boolean().default(true),
      version: z.number().optional().nullable().default(0),
      vatRates: z
        .array(VatRateInfo.validationSchema)
        .optional()
        .nullable()
        .transform((v) => (v ? v.map((i) => new VatRateInfo(i)) : [])),
      agreements: z
        .array(AllowedAgreement.validationSchema)
        .default([])
        .transform((v) => (v ? v.map((i) => new AllowedAgreement(i)) : [])),
    })
  }

  static get dbSchema() {
    return {
      name: String,
      company: {
        type: Types.ObjectId,
        ref: 'Company',
      },
      agreements: [AllowedAgreement.dbSchema],
      companyInfo: CompanyInfo.dbSchema,
      bankAccountInfo: BankAccountInfo.dbSchema,
      contacts: [ContactInfo.dbSchema],
      outsource: {
        type: Boolean,
        default: false,
      },
      allowUseCustomerRole: {
        type: Boolean,
        default: false,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      version: { type: Number, default: 0 },
      vatRates: [VatRateInfo.dbSchema],
    }
  }
}
