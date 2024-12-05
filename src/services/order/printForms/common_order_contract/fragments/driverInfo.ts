import { Paragraph, TextRun, UnderlineType } from 'docx'
import { BLOCK_SPACE } from '../config'
import { IDriverInfoProps } from '../interfaces'

export const driverInfo = (p: IDriverInfoProps): Paragraph => {
  return new Paragraph({
    spacing: {
      before: BLOCK_SPACE,
    },
    children: [
      new TextRun({
        text: `Водитель: ${p.fullName}`,
        bold: true,
        underline: { type: UnderlineType.SINGLE },
      }),
      new TextRun({
        text: `Паспорт: ${p.passport}`,
        break: 2,
      }),
      new TextRun({
        text: `Тел: ${p.phone}`,
        break: 1,
      }),
      new TextRun({
        text: `Гос.номер ТС: ${p.tsRegNum}`,
        break: 1,
      }),
    ],
  })
}
