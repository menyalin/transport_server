import {
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import { IHeaderTableFragmentProps } from '../interfaces'
import { noBorder } from './constants'

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

export const headerTableBuilder = (props: IHeaderTableFragmentProps): Table => {
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
      rowBulder('Исполнитель:', props.executor),
      rowBulder('Заказчик:', props.customer),
      rowBulder('Основание:', props.basis),
    ],
  })
}
