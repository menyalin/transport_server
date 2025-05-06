import { AlignmentType, Paragraph, TextRun } from 'docx'
import { sectionDividerBottom } from './dividers'

export const commonDocDescriptionBuilder = (description: string): Paragraph => {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: description
      .split('\n')
      .map((d) => new TextRun({ text: d, size: 18, break: 1 })),
    border: {
      bottom: sectionDividerBottom,
    },
  })
}
