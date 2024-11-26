import { Paragraph, TextRun } from 'docx'
import { FileChild } from 'docx/build/file/file-child'
import { BLOCK_SPACE } from '../config'

export const noteInfo = (notes: string[]): FileChild[] => {
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
    ...notes.map(
      (note) =>
        new Paragraph({
          numbering: { reference: 'main-numbering', level: 0 },
          
          children: [new TextRun({ text: note, italics: true })],
        })
    ),
  ]
}
