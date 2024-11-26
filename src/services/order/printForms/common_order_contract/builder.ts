import { numbering, styles } from '@/shared/printForms'
import {
  Packer,
  Paragraph,
  TextRun,
  Document,
  AlignmentType,
  HeadingLevel,
  Table,
  WidthType,
  TableRow,
  TableCell,
  VerticalAlign,
  TableBorders,
} from 'docx'
import { shipperInfo } from './fragments/shipperInfo'
import { driverInfo } from './fragments/driverInfo'
import { paymentInfo } from './fragments/paymentInfo'
import { noteInfo } from './fragments/noteInfo'
import { mockRoute, notes } from './mockData'
import { signatoriesInfo } from './fragments/signatoriesInfo'
import { routeInfo } from './fragments/route/routeInfo'

export const commonOrderContractBuilder = async (): Promise<Buffer> => {
  const doc = new Document({
    numbering: numbering.mainNumbering(),
    styles: {
      default: {
        ...styles.defaultDocStyles,
        document: { run: { size: '9pt', font: 'Times New Roman' } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 500,
              left: 600,
              right: 500,
              bottom: 500,
            },
          },
        },
        children: [
          new Paragraph({
            style: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Заявка № 2121 от 21.12.2024',
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
              size: 90,
              type: WidthType.PERCENTAGE,
            },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 0, bottom: 0 },
                    children: [
                      new Paragraph({
                        text: 'ЗАКАЗЧИК: ООО «Автокоммерц»',
                        alignment: AlignmentType.LEFT,
                      }),
                    ],
                  }),
                  new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 0, bottom: 0 },
                    children: [
                      new Paragraph({
                        text: 'ПЕРЕВОЗЧИК: ИП Юдин С.В.',
                        alignment: AlignmentType.RIGHT,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          shipperInfo(),
          routeInfo(mockRoute),
          driverInfo(),
          paymentInfo(),
          ...noteInfo(notes),
          ...signatoriesInfo(),
        ],
      },
    ],
  })
  return await Packer.toBuffer(doc)
}
