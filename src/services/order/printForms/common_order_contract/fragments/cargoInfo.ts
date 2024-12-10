import { Paragraph, TextRun } from 'docx'
import { BLOCK_SPACE } from '../config'
import { ICargoInfoProps } from '../interfaces'

export const cargoInfo = (p: ICargoInfoProps): Paragraph => {
  const info: TextRun[] = []
  const transport: TextRun[] = []

  p.description &&
    info.push(new TextRun({ text: `Груз: ${p.description} `, bold: true }))
  p.weight && info.push(new TextRun({ text: `Вес: ${p.weight}т. ` }))
  p.plt && info.push(new TextRun({ text: `Кол-во паллет: ${p.plt}, ` }))
  p.volume &&
    info.push(
      ...[
        new TextRun({ text: `Объем: ${p.volume} м` }),
        new TextRun({ text: '3', superScript: true }),
      ]
    )
  info.length && info.push(new TextRun({ text: '', break: 1 }))
  p.note &&
    info.push(
      new TextRun({ text: `Примечание: ${p.note}`, italics: true }),
      new TextRun({ text: '', break: 1 })
    )

  p.truckType &&
    transport.push(
      new TextRun({
        text: `Тип подвижного состава: ${p.truckType} `,
        bold: true,
      })
    )
  p.tRegime &&
    transport.push(new TextRun({ text: `Температурный режим: ${p.tRegime}` }))

  return new Paragraph({
    spacing: {
      before: BLOCK_SPACE,
    },
    children: [...info, ...transport],
  })
}
