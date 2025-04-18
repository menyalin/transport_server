import {
  AlignmentType,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import { IMainTableResultFragmentProps } from '../interfaces'
import { noBorder, priceCellWidth } from './constants'
import { moneyFormatter } from '../../../../../utils/moneyFormatter'
import { convert } from 'number-to-words-ru'

export const resultTableBuilder = (
  props: IMainTableResultFragmentProps
): Table => {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      bottom: noBorder,
      top: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      // Первая строка с общей суммой
      new TableRow({
        children: [
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 0, type: WidthType.AUTO },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Итого:', bold: true, size: 18 }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            width: priceCellWidth,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: moneyFormatter(props.priceWithVat),
                    bold: true,
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      // Вторая строка с суммой НДСа
      new TableRow({
        children: [
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 0, type: WidthType.AUTO },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `В том числе НДС ${props.vatRate}%`,
                    bold: true,
                    size: 18,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            width: priceCellWidth,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: moneyFormatter(props.priceWithVat - props.priceWOVat),
                    bold: true,
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      // Третья строка
      new TableRow({
        children: [
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 0, type: WidthType.AUTO },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Всего оказано услуг ${props.ordersCount}, на сумму ${moneyFormatter(props.priceWithVat)}руб.`,
                    size: 16,
                  }),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
          }),
        ],
      }),
      // Четвертая строка c итогами прописью
      new TableRow({
        children: [
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 0, type: WidthType.AUTO },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: convert(props.priceWithVat, {
                      currency: 'rub',
                    }),
                    size: 18,
                    bold: true,
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
}
