import { AlignmentType, Paragraph, TextRun } from 'docx'
import { sectionDividerBottom } from './constants'

export const descriptionBuilder = (description: string): Paragraph => {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text: description, size: 18 })],
    border: {
      bottom: sectionDividerBottom,
    },
  })
}
