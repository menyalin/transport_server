import { PAIMENT_INVOICE_STATUSES_ENUM } from '../../constants/paymentInvoice'

export interface IInvoiceStatsProps {
  invoiceId: string
  status: PAIMENT_INVOICE_STATUSES_ENUM
  invoiceDate: Date
}
