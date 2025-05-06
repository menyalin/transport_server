import {
  IBorderOptions,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import { ICommonDocHeaderTableProps } from '../interfaces'

export const noBorder: IBorderOptions = {
  style: 'none',
  size: 0,
  color: 'FFFFFF',
  space: 3,
}

const rowBulder = (title: string, value: string): TableRow =>
  new TableRow({
    children: [
      new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            children: [new TextRun({ text: title, size: 18 })],
            indent: { left: 10 },
          }),
        ],
      }),
      new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            indent: { left: 10 },
            children: [new TextRun({ text: value, bold: true, size: 20 })],
          }),
        ],
      }),
    ],
  })

export const commonDocHeaderTableBuilder = (
  props: ICommonDocHeaderTableProps
): Table => {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: {
      bottom: 50,
    },
    borders: {
      bottom: noBorder,
      top: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      rowBulder(`${props.executorTitle}:`, props.executor),
      rowBulder(`${props.customerTitle}:`, props.customer),
      rowBulder('Основание:', props.basis),
    ],
  })
}
