import { Paragraph, TextRun, UnderlineType } from 'docx'
import { BLOCK_SPACE } from '../config'

export const paymentInfo = (): Paragraph => {
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
        text: `21 000,00 (Двадцать одна тысяча рублей). Безналичный расчет в т.ч. НДС 20%, по оригинальным ТТН, ТН, счет, акт, договор, заявки,
заверенные подписью и печатью Уставных документов, квиток о сдаче декларации НДС. 14 рабочих дней.`,
        break: 1,
      }),
    ],
  })
}
