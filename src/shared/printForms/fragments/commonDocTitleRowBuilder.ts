import { AlignmentType, Paragraph, TextRun } from 'docx'
import { ICommonTitleRowProps } from '../interfaces'
import { sectionDividerBottom } from './dividers'

export const commonDocTitleRowBuilder = ({
  number,
  date,
  docName,
}: ICommonTitleRowProps): Paragraph => {
  const formattedDate = date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return new Paragraph({
    children: [
      new TextRun({
        text: `${docName} № ${number} от ${formattedDate}`,
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
