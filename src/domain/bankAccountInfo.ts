import { z, ZodError } from 'zod'

export class BankAccountInfo {
  accountNumber?: string
  bankName?: string
  bankCode?: string
  correspondentAccount?: string

  constructor(props: unknown) {
    try {
      const p = BankAccountInfo.validationSchema.parse(props)
      this.accountNumber = p.accountNumber
      this.bankName = p.bankName
      this.bankCode = p.bankCode
      this.correspondentAccount = p.correspondentAccount
    } catch (e) {
      if (e instanceof ZodError) {
        console.error('BankAccountInfo Validation Error: ', e.errors)
      } else {
        console.error('BankAccountInfo Unknown Error: ', e)
      }
      throw e
    }
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
      accountNumber: z.string().optional(),
      bankName: z.string().optional(),
      bankCode: z.string().optional(),
      correspondentAccount: z.string().optional(),
    })
  }
}
