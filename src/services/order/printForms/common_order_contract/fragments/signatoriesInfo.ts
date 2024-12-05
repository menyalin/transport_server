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
import { FileChild } from 'docx/build/file/file-child'
import { companyInfo } from './companyInfo'
import { signatoryCell } from './signatoryCell'
import { BLOCK_SPACE } from '../config'
import { ICarreierPFData } from '@/domain/carrier/interfaces'

export const signatoriesInfo = (
  customer: ICarreierPFData,
  carrier: ICarreierPFData
): FileChild[] => {
  return [
    new Paragraph({
      spacing: {
        before: BLOCK_SPACE,
        after: 100,
      },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'РЕКВИЗИТЫ И ПОДПИСИ СТОРОН',
        }),
      ],
    }),
    new Table({
      borders: TableBorders.NONE,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: {
                size: 50,
                type: WidthType.PERCENTAGE,
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'ЗАКАЗЧИК', bold: true })],
                }),
              ],
            }),
            new TableCell({
              width: {
                size: 50,
                type: WidthType.PERCENTAGE,
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'ИСПОЛНИТЕЛЬ', bold: true })],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [companyInfo(customer)],
            }),
            new TableCell({
              children: [companyInfo(carrier)],
            }),
          ],
        }),

        new TableRow({
          children: [
            new TableCell({
              margins: { top: 200, bottom: 200, left: 0, right: 400 },
              children: [
                signatoryCell({
                  position: customer.signatoryPosition,
                  name: customer.signatoryName,
                }),
              ],
            }),
            new TableCell({
              margins: { top: 200, bottom: 200, left: 0, right: 0 },
              children: [
                signatoryCell({
                  position: carrier.signatoryPosition,
                  name: carrier.signatoryName,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ]
}
