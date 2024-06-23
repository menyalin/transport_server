import {
  AlignmentType,
  BorderStyle,
  HeightRule,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  VerticalAlign,
  WidthType,
} from 'docx'
import { ISignatute } from '../shared/interfaces'

export const okActSignatoriesTableBuilder = (
  signatories: ISignatute[]
): Table => {
  return new Table({
    borders: TableBorders.NONE,
    width: {
      size: 80,
      type: WidthType.PERCENTAGE,
    },
    alignment: AlignmentType.CENTER,
    rows: signatories.map(
      (signer) =>
        new TableRow({
          height: { value: 1000, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              verticalAlign: VerticalAlign.BOTTOM,
              width: {
                size: 50,
                type: WidthType.PERCENTAGE,
              },
              margins: { top: 0, bottom: 0 },

              children: [
                new Paragraph({
                  text: signer.role,
                  style: 'wihtoutIndent',
                  alignment: AlignmentType.LEFT,
                }),
              ],
            }),
            new TableCell({
              verticalAlign: VerticalAlign.BOTTOM,
              margins: { top: 0, bottom: 0 },
              borders: { bottom: { size: 1, style: BorderStyle.SINGLE } },
              children: [
                new Paragraph({
                  text: signer.name,
                  style: 'wihtoutIndent',
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
          ],
        })
    ),
  })
}
