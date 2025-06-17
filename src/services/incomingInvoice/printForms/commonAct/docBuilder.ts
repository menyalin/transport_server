import { Packer } from 'docx'
import { incomingInvoiceDataBuilder } from './dataBuilder'
import { commonActDocumentBuilder } from '@/shared/printForms/commonAct'

export const commonActBuilder = async (invoiceId: string): Promise<Buffer> => {
  const data = await incomingInvoiceDataBuilder(invoiceId)
  const doc = commonActDocumentBuilder(data)
  return await Packer.toBuffer(doc)
}
