import { Paragraph, TextRun } from 'docx'
import { FileChild } from 'docx/build/file/file-child'
import { BLOCK_SPACE } from '../config'

export const noteInfo = (notes: string[] | null): FileChild[] => {
  const data = notes?.length ? notes : ['Нет примечаний']
  return [
    new Paragraph({
      spacing: {
        before: BLOCK_SPACE,
      },
      children: [
        new TextRun({
          text: 'Примечание:',
          italics: true,
          bold: true,
        }),
      ],
    }),
    ...data.map(
      (note) =>
        new Paragraph({
          numbering: { reference: 'main-numbering', level: 0 },

          children: [new TextRun({ text: note, italics: true })],
        })
    ),
  ]
}
