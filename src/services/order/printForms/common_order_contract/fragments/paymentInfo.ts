import { Paragraph, TextRun, UnderlineType } from 'docx'
import { BLOCK_SPACE } from '../config'
import { IPaymentInfoProps } from '../interfaces'
import { moneyFormatter } from '@/utils/moneyFormatter'
import { convert } from 'number-to-words-ru'

export const paymentInfo = (p: IPaymentInfoProps): Paragraph => {
  const fomattedSum = moneyFormatter(p.paymentSum)
  const writtenSum = convert(p.paymentSum)

  return new Paragraph({
    spacing: {
      before: BLOCK_SPACE,
    },
    children: [
      new TextRun({
        text: 'Стоимость и условия оплаты',
        bold: true,
        underline: { type: UnderlineType.SINGLE },
      }),

      new TextRun({
        text: p.paymentSum
          ? `${fomattedSum} (${writtenSum}). ${p.paymentDescription}`
          : p.paymentDescription,
        break: 2,
      }),
    ],
  })
}
