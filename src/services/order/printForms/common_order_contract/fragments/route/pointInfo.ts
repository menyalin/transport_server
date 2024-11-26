import { POINT_TYPES_ENUM } from '@/constants/enums'
import { IRoutePointPFData } from '@/domain/order/route/interfaces'
import {
  AlignmentType,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'

export const pointInfo = (point: IRoutePointPFData): Table =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TableBorders.NONE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 900, type: WidthType.DXA },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    bold: true,
                    text:
                      point.pointType === POINT_TYPES_ENUM.loading
                        ? 'Погрузка'
                        : 'Разгрузка',
                  }),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
            borders: TableBorders.NONE,
          }),

          new TableCell({
            width: { size: 1500, type: WidthType.DXA },
            children: [
              new Paragraph({
                children: [
                  point.plannedDateTime
                    ? new TextRun({
                        text: point.plannedDateTime,
                      })
                    : new TextRun({ text: '' }),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
          }),
          new TableCell({
            width: { size: 2000, type: WidthType.DXA },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: point.partnerName,
                  }),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Адрес: ${point.address}`,
                  }),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
          }),
        ],
      }),

      new TableRow({
        children: [
          new TableCell({
            columnSpan: 4,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Примечание: ${point.note}`,
                    italics: true,
                  }),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
          }),
        ],
      }),
    ],
  })
