import { z, ZodError } from 'zod'

export class BankAccountInfo {
  accountNumber?: string | null
  bankName?: string | null
  bankCode?: string | null
  correspondentAccount?: string | null

  constructor(props: unknown) {
    try {
      const p = BankAccountInfo.validationSchema.parse(props)
      this.accountNumber = p.accountNumber
      this.bankName = p.bankName
      this.bankCode = p.bankCode
      this.correspondentAccount = p.correspondentAccount
    } catch (e) {
      if (e instanceof ZodError) {
        console.error('BankAccountInfo Validation Error: ', e)
      } else {
        console.error('BankAccountInfo Unknown Error: ', e)
      }
      throw e
    }
  }
  getFullDataString(): string {
    return `р/с ${this.accountNumber ?? ''}, ${this.bankName ?? ''}, БИК ${this.bankCode ?? ''}, к/с ${this.correspondentAccount ?? ''}`
  }

  static get dbSchema() {
    return {
      accountNumber: String,
      bankName: String,
      bankCode: String,
      correspondentAccount: String,
    }
  }

  static get validationSchema() {
    return z.object({
      accountNumber: z.string().nullable().optional(),
      bankName: z.string().nullable().optional(),
      bankCode: z.string().nullable().optional(),
      correspondentAccount: z.string().nullable().optional(),
    })
  }
}
