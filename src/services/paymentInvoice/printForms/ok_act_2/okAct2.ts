import { Packer } from 'docx'
import { formBuilder } from './formBuilder'
import { IPaymentInvoicePrintFormBuilder } from '@/domain/printForm/interfaces'
import { IOkAktBuilderProps } from '../shared/interfaces'
import { moneyFormatter } from '@/utils/moneyFormatter'

export async function okAktBuilder({
  invoice,
  pf,
}: IPaymentInvoicePrintFormBuilder): Promise<Buffer> {
  const locale = 'ru-RU'
  let p: IOkAktBuilderProps = {
    docNumber: invoice.number,
    date: invoice.sendDate.toLocaleDateString(locale),
    contractNumber: pf.data.contractNumber,
    contractDate: pf.data.contractDate,
    actHeader: pf.data.actHeader,
    actHeaderFragments: pf.data.actHeaderFragments,
    signatories: pf.data.signatories,
    startPeriod:
      invoice.invoicePeriod?.start.toLocaleDateString(locale) ||
      'Дата не определена',
    endPeriod:
      invoice.invoicePeriod?.end.toLocaleDateString(locale) ||
      'Дата не определена',
    totalSum: moneyFormatter(invoice.invoiceTotalSumWithVat, locale),
    vatSum: moneyFormatter(invoice.invoiceVatSum, locale),
  }
  const doc = formBuilder(p)
  return await Packer.toBuffer(doc)
}
