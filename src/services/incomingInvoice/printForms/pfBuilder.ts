import { commonActBuilder } from './commonAct/docBuilder'

interface IIncomingInvoicePFBuilderProps {
  invoiceId: string
  templateName: string
}

export const incomingInvoicePFBuilder = async ({
  invoiceId,
  templateName,
}: IIncomingInvoicePFBuilderProps): Promise<Buffer> => {
  if (!invoiceId || !templateName)
    throw new Error('incomingInvoicePFBuilder : required args is missing')

  let builder = commonActBuilder
  return await builder(invoiceId)
}
