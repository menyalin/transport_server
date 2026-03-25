import { AlignmentType, Paragraph, TextRun } from 'docx'

export const formHeaderBuilder = (): Paragraph[] => [
  new Paragraph({
    style: 'formHeader',
    children: [
      new TextRun({ text: 'Приложение № 4' }),
      new TextRun({
        text: 'к Правилам перевозок грузов автомобильным транспортом',
        break: 1,
      }),
      new TextRun({
        text: '(в редакции постановления Правительства Российской Федерации',
        break: 1,
      }),
      new TextRun({
        text: 'от 30 ноября 2021 г. № 2116)',
        break: 1,
      }),
    ],

    alignment: AlignmentType.RIGHT,
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Транспортная накладная (форма)' })],
  }),
]
