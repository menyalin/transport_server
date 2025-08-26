import { sectionDividerBottom } from '@/shared/printForms/fragments'
import { AlignmentType, Paragraph, TextRun } from 'docx'

export const descriptionBuilder = (description: string): Paragraph => {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text: description, size: 18 })],
    border: {
      bottom: sectionDividerBottom,
    },
  })
}
