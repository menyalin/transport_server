import { z } from 'zod'

export class InsuranceInfo {
  osagoNum?: string | null
  osagoExpDate?: Date | null
  osagoCompany?: string | null
  kaskoNum?: string | null
  kaskoExpDate?: Date | null
  kaskoCompany?: string | null
  leasingСompany?: string | null

  constructor(props: unknown) {
    const p = InsuranceInfo.validationSchema.parse(props)
    this.osagoNum = p.osagoNum
    this.osagoExpDate = p.osagoExpDate
    this.osagoCompany = p.osagoCompany
    this.kaskoNum = p.kaskoNum
    this.kaskoExpDate = p.kaskoExpDate
    this.kaskoCompany = p.kaskoCompany
    this.leasingСompany = p.leasingСompany
  }

  static get validationSchema() {
    return z.object({
      osagoNum: z.string().optional().nullable(),
      osagoExpDate: z.date().optional().nullable(),
      osagoCompany: z.string().optional().nullable(),
      kaskoNum: z.string().optional().nullable(),
      kaskoExpDate: z.date().optional().nullable(),
      kaskoCompany: z.string().optional().nullable(),
      leasingСompany: z.string().optional().nullable(),
    })
  }

  static get dbSchema() {
    return {
      osagoNum: String,
      osagoExpDate: Date,
      osagoCompany: String,
      kaskoNum: String,
      kaskoExpDate: Date,
      kaskoCompany: String,
      leasingСompany: String,
    }
  }
}
