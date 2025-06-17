import { Packer } from 'docx'
import { paymentInvoiceDataBuilder } from './dataBuilder'
import { commonActDocumentBuilder } from '@/shared/printForms/commonAct'
import { IPaymentInvoiceDocumentBuilderProps } from '../interfaces'
import { BadRequestError } from '@/helpers/errors'

export const commonActBuilder = async ({
  invoice,
}: IPaymentInvoiceDocumentBuilderProps): Promise<Buffer> => {
  if (!invoice || !invoice?._id)
    throw new BadRequestError('invalid payment invoice')
  const data = await paymentInvoiceDataBuilder(invoice._id)

  const doc = commonActDocumentBuilder(data)
  return await Packer.toBuffer(doc)
}
