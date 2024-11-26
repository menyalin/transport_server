import { IRoutePointPFData } from '@/domain/order/route/interfaces'
import {
  AlignmentType,
  BorderStyle,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from 'docx'
import { pointInfo } from './pointInfo'

export const routeInfo = (route: IRoutePointPFData[]): Table =>
  new Table({
    borders: TableBorders.NONE,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: {
              top: 150,
              bottom: 50,
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Маршрут',
                    bold: true,
                    underline: { type: UnderlineType.SINGLE },
                  }),
                ],
                alignment: AlignmentType.LEFT,
                indent: { firstLine: 0 },
              }),
            ],
            borders: TableBorders.NONE,
          }),
        ],
      }),
      ...route.map(
        (p) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 100, type: WidthType.PERCENTAGE },
                margins: { top: 100, bottom: 100 },
                children: [pointInfo(p)],
                borders: {
                  bottom: { style: BorderStyle.SINGLE },
                },
              }),
            ],
          })
      ),
    ],
  })
