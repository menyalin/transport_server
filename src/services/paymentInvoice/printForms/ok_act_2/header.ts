import { AlignmentType, Paragraph, TextRun } from 'docx'
import { IHeaderFragment } from '../shared/interfaces'

export const headerBuilder = (headerFragments: IHeaderFragment[]) =>
  new Paragraph({
    children: headerFragments.map(
      (fragment) => new TextRun({ text: fragment.text, bold: fragment.isBold })
    ),
    spacing: {
      before: 400,
      after: 200,
      line: 300,
    },
    alignment: AlignmentType.THAI_DISTRIBUTE,
  })
