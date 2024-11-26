import { Paragraph, TextRun } from 'docx'
import { BLOCK_SPACE } from '../config'

export const shipperInfo = (): Paragraph => {
  return new Paragraph({
    spacing: {
      before: BLOCK_SPACE,
    },
    children: [
      new TextRun({
        text: 'Наименование груза: Куриные изделия',
        break: 1,
      }),
      new TextRun({
        text: 'Объем: 80 м',
        break: 1,
      }),
      new TextRun({
        text: 'Вес: 20т',
        break: 1,
      }),
      new TextRun({
        text: 'Дополнительные сведения о грузе: какие-то доп. сведения о грузе',
        break: 1,
      }),
      new TextRun({
        text: 'Тип подвижного состава: 20т Реф',
        break: 1,
      }),
      new TextRun({
        text: 'Температурный режим: -20 °С',
        break: 1,
      }),
    ],
  })
}
