import { PaymentInvoiceDomain } from '../paymentInvoice/paymentInvoice'
import { PrintForm } from './printForm.domain'

export interface IPaymentInvoicePrintFormBuilder {
  invoice: PaymentInvoiceDomain
  pf: PrintForm
}
