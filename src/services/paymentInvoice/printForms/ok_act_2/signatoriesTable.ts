import {
  AlignmentType,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import { ISignatute } from '../shared/interfaces'

const titleCell = (
  text: string = '',
  bold: boolean = false,
  beforeSpacing = 30
): TableCell =>
  new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          before: beforeSpacing,
          after: 0,
        },
      }),
    ],
    verticalAlign: VerticalAlign.CENTER,
    width: {
      size: 50,
      type: WidthType.PERCENTAGE,
    },
    margins: { left: 0, top: 0 },
  })

export const okActSignatoriesTableBuilder = (
  signatories: ISignatute[]
): Table => {
  return new Table({
    borders: TableBorders.NONE,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          titleCell(signatories[0].role, true),
          titleCell(signatories[1].role, true),
        ],
      }),

      new TableRow({
        children: [
          titleCell(signatories[0].companyName, true),
          titleCell(signatories[1].companyName, true),
        ],
        // height: { value: 200, rule: HeightRule.ATLEAST },
      }),

      new TableRow({
        children: [
          titleCell(signatories[0]?.position),
          titleCell(signatories[1]?.position),
        ],
      }),
      new TableRow({
        children: [
          titleCell('_________________/ ' + signatories[0]?.name, false, 800),
          titleCell('_________________/ ' + signatories[1]?.name, false, 800),
        ],
        // height: { value: 800, rule: HeightRule.AUTO },
      }),
    ],
  })
}
