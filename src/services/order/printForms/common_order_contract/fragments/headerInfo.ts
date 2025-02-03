import {
  Paragraph,
  HeadingLevel,
  AlignmentType,
  TextRun,
  Table,
  TableBorders,
  WidthType,
  TableRow,
  TableCell,
  VerticalAlign,
} from 'docx'
import { IHeaderInfoProps } from '../interfaces'
import { FileChild } from 'docx'

export const headerInfo = (p: IHeaderInfoProps): FileChild[] => [
  new Paragraph({
    style: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: `Заявка № ${p.num} от ${p.date}`,
        bold: true,
      }),
    ],
  }),
  new Table({
    borders: TableBorders.NONE,
    indent: { size: 0 },
    margins: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            width: {
              size: 50,
              type: WidthType.PERCENTAGE,
            },
            margins: { top: 0, bottom: 0 },
            children: [
              new Paragraph({
                text: `ЗАКАЗЧИК: ${p.customer}`,
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0 },
            width: {
              size: 50,
              type: WidthType.PERCENTAGE,
            },
            children: [
              new Paragraph({
                text: `ПЕРЕВОЗЧИК: ${p.carrier}`,
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
    ],
  }),
]
