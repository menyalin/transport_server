import { PrintFormRepository, PaymentInvoiceRepository } from '@/repositories'
import { okAktBuilder } from './ok_act/okAct'
import { okAktBuilder as okAkt2Builder } from './ok_act_2/okAct2'
import { commonActBuilder } from './commonAct'
import { IDocumentBuilder } from './interfaces'
import { BadRequestError } from '@/helpers/errors'

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

  let docBuilder: IDocumentBuilder

  switch (printForm?.pfType) {
    case 'ok_act':
      docBuilder = okAktBuilder
      break
    case 'ok_act_2':
      docBuilder = okAkt2Builder
      break
    case 'common_act':
      docBuilder = commonActBuilder
      break

    default:
      throw new BadRequestError(
        'paymentInvoiceDocumentBuilder : printForm not found'
      )
  }
  const buffer = await docBuilder({ invoice: paymentInvoice, pf: printForm })
  return buffer
}
