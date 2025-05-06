import { BadRequestError } from '@/helpers/errors'
import { commonActBuilder } from './commonAct/docBuilder'
import { commonPaymentBillBuilder } from './commonPaymentBill/docBuilder'
interface IIncomingInvoicePFBuilderProps {
  invoiceId: string
  templateName: string
}

export const incomingInvoicePFBuilder = async ({
  invoiceId,
  templateName,
}: IIncomingInvoicePFBuilderProps): Promise<Buffer> => {
  const buildersMap = new Map()
  if (!invoiceId || !templateName)
    throw new Error('incomingInvoicePFBuilder : required args is missing')
  buildersMap.set('common_act', commonActBuilder)
  buildersMap.set('common_payment_bill', commonPaymentBillBuilder)

  if (!buildersMap.has(templateName))
    throw new BadRequestError('Не корректное имя шаблона печатной формы')

  let builder = buildersMap.get(templateName)
  return await builder(invoiceId)
}
