import { PaymentInvoiceDomain } from '../paymentInvoice/paymentInvoice'
import { PrintForm } from './printForm.domain'

export interface IPaymentInvoicePrintFormBuilder {
  invoice: PaymentInvoiceDomain
  pf: PrintForm
}

export interface IPrintFormFileData {
  filetype: string
  filename: string
  buffer: Buffer
}
