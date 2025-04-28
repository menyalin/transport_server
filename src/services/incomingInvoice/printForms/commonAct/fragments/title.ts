import { AlignmentType, Paragraph, TextRun } from 'docx'
import { ITitleRowFragmentProps } from '../interfaces'
import { sectionDividerBottom } from './constants'

export const rowTitleBuilder = ({ number, date }: ITitleRowFragmentProps) => {
  const formattedDate = date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return new Paragraph({
    children: [
      new TextRun({
        text: `Акт № ${number} от ${formattedDate}`,
        bold: true,
        size: 28,
      }),
    ],
    spacing: {
      after: 200,
    },
    alignment: AlignmentType.LEFT,
    indent: { firstLine: 50 },
    border: {
      bottom: sectionDividerBottom,
    },
  })
}
