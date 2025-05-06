import {
  AlignmentType,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import { ISignatoriesFragmentProps } from '../interfaces'
import { hiddenAllBorders } from '@/shared/printForms/fragments'

export const signatoriesTableBuilder = (
  props: ISignatoriesFragmentProps
): Table => {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: hiddenAllBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 48, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'ИСПОЛНИТЕЛЬ', bold: true, size: 20 }),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
          }),
          new TableCell({
            width: { size: 5, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: '' })],
              }),
            ],
          }),
          new TableCell({
            width: { type: WidthType.AUTO, size: 0 },

            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'ЗАКАЗЧИК', bold: true, size: 20 }),
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
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: {
                  before: 0,
                  after: 500,
                },
                children: [
                  new TextRun({
                    text: `${props.executorSignatoryPosition} ${props.executorCompanyName}`,
                  }),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
            borders: {
              bottom: { style: 'single', size: 2, color: '000000' },
            },
          }),
          new TableCell({
            width: { size: 5, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: '' })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },

            borders: {
              bottom: { style: 'inset', size: 2, color: '000000' },
            },
            children: [
              new Paragraph({
                children: [new TextRun({ text: props.customerCompanyName })],
                alignment: AlignmentType.LEFT,
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: props.executorSignatoryName,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
    ],
  })
}
