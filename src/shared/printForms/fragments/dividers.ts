import { IBorderOptions, Paragraph, TextRun } from 'docx'

export const sectionDividerBottom: IBorderOptions = {
  color: 'auto',
  space: 6,
  style: 'single',
  size: 15,
}

export const spacingParagraph = (lineHeight: number = 150): Paragraph =>
  new Paragraph({
    children: [new TextRun('')],
    spacing: {
      line: lineHeight,
    },
  })
