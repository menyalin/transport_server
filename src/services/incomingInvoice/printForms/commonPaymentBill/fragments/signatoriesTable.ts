import { hiddenAllBorders } from '@/shared/printForms/fragments'
import {
  AlignmentType,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import { ISignatoriesTableProps } from '../interfaces'

export const signatoriesTableBuilder = (
  props: ISignatoriesTableProps
): Table => {
  const signatoryCell = (position: string, name: string): Table =>
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: hiddenAllBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { type: WidthType.NIL, size: 0 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: position, bold: true, size: 20 }),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
              ],
            }),
            new TableCell({
              width: { type: WidthType.AUTO, size: 0 },
              borders: {
                bottom: { size: 1, style: 'single' },
              },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: name, size: 18 })],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
          ],
        }),
      ],
    })

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: hiddenAllBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 48, type: WidthType.PERCENTAGE },
            children: [signatoryCell('Руководитель', props.directorName)],
          }),
          new TableCell({
            width: { size: 5, type: WidthType.PERCENTAGE },
            children: [],
          }),
          new TableCell({
            width: { type: WidthType.AUTO, size: 0 },
            children: [signatoryCell('Бухгалтер', props.accountantName)],
          }),
        ],
      }),
    ],
  })
}
