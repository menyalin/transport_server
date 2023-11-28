import {
  PrintFormRepository,
  PaymentInvoiceRepository,
} from '../../../repositories'
import { okAktBuilder } from './ok_act/okAct'

export const paymentInvoiceDocumentBuilder = async (
  invoiceId: string,
  templateName: string
): Promise<Buffer> => {
  if (!invoiceId || !templateName)
    throw new Error('paymentInvoiceDocumentBuilder : required args is missing')

  const paymentInvoice =
    await PaymentInvoiceRepository.getInvoiceById(invoiceId)

  if (!paymentInvoice)
    throw new Error('paymentInvoiceDocumentBuilder : paymentInvoice not found')

  const printForm = await PrintFormRepository.getByTemplateName(templateName)
  if (!printForm)
    throw new Error('paymentInvoiceDocumentBuilder : printForm not found')
  const buffer = await okAktBuilder({ invoice: paymentInvoice, pf: printForm })
  return buffer
}
