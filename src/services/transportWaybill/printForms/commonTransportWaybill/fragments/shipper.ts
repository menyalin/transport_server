import {
  AlignmentType,
  BorderStyle,
  Paragraph,
  TableCell,
  TableRow,
  TextRun,
} from 'docx'
import { IShipperFragmentProps } from '../interfaces'

const titleRow = (): TableRow =>
  new TableRow({
    children: [
      new TableCell({
        rowSpan: 2,
        // margins: {
        //   top: 500,
        //   bottom: 500,
        //   left: 500,
        //   right: 500,
        // },
        borders: {
          bottom: {
            style: BorderStyle.SINGLE,
          },
        },

        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: '1. Грузоотправитель', bold: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: 'является экспедитором   ' }),
              new TextRun({ text: '☐', size: 24, bold: true }),
            ],
          }),
        ],
      }),
      new TableCell({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '1а. «Заказчик  услуг, связанных с перевозкой груза (при наличии)»',
                bold: true,
              }),
            ],
          }),
        ],
      }),
    ],
  })

export const shipperFragmentBuilder = (
  _props: IShipperFragmentProps
): TableRow[] => {
  return [
    titleRow(),
    new TableRow({
      children: [
        new TableCell({
          children: [],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [],
        }),
        new TableCell({
          children: [],
        }),
      ],
    }),
  ]
}
