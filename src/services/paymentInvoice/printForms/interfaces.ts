import { PaymentInvoiceDomain } from '@/domain/paymentInvoice/paymentInvoice'
import { PrintForm } from '@/domain/printForm/printForm.domain'

export interface IPaymentInvoiceDocumentBuilderProps {
  invoice: PaymentInvoiceDomain
  pf: PrintForm
}

export interface IDocumentBuilder {
  (data: IPaymentInvoiceDocumentBuilderProps): Promise<Buffer>
}
