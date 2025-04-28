import {
  AlignmentType,
  IBorderOptions,
  IIndentAttributesProperties,
  ITableWidthProperties,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import { IMainTableFragmentProps } from '../interfaces'
import { minCellWidth, paragraphCellIntent, priceCellWidth } from './constants'

export const mainTableBuilder = (props: IMainTableFragmentProps): Table => {
  const rowBuilder = (
    idx: string,
    title: string,
    count: string,
    measurementUnit: string,
    price: string,
    sum: string,
    isHeader: boolean
  ): TableRow =>
    new TableRow({
      tableHeader: isHeader,
      children: [
        new TableCell({
          width: minCellWidth,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [new TextRun({ text: idx, bold: isHeader })],
              alignment: AlignmentType.CENTER,
              indent: paragraphCellIntent,
            }),
          ],
        }),
        new TableCell({
          width: {
            size: 0,
            type: WidthType.AUTO,
          },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [new TextRun({ text: title, bold: isHeader })],
              spacing: {
                after: isHeader ? 70 : 20,
                before: isHeader ? 70 : 20,
              },
              alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
              indent: paragraphCellIntent,
            }),
          ],
        }),
        new TableCell({
          width: minCellWidth,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [new TextRun({ text: count, bold: isHeader })],
              alignment: isHeader ? AlignmentType.CENTER : AlignmentType.RIGHT,
              indent: paragraphCellIntent,
            }),
          ],
        }),
        new TableCell({
          width: minCellWidth,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: measurementUnit, bold: isHeader }),
              ],
              alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
              indent: paragraphCellIntent,
            }),
          ],
        }),
        new TableCell({
          width: priceCellWidth,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [new TextRun({ text: price, bold: isHeader })],
              alignment: isHeader ? AlignmentType.CENTER : AlignmentType.RIGHT,
              indent: paragraphCellIntent,
            }),
          ],
        }),
        new TableCell({
          width: priceCellWidth,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [new TextRun({ text: sum, bold: isHeader })],
              alignment: isHeader ? AlignmentType.CENTER : AlignmentType.RIGHT,
              indent: paragraphCellIntent,
            }),
          ],
        }),
      ],
    })

  const outsideBorder: IBorderOptions = {
    style: 'single',
    size: 10,
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      bottom: outsideBorder,
      top: outsideBorder,
      left: outsideBorder,
      right: outsideBorder,
    },
    rows: [
      rowBuilder(
        '№',
        'Наименование работ, услуг',
        'Кол-во',
        'Ед.',
        'Цена',
        'Сумма',
        true
      ),
      ...props.rows.map((row, idx) =>
        rowBuilder(
          (idx + 1).toString(),
          row.title,
          row.count,
          row.measurementUnit,
          row.price,
          row.sum,
          false
        )
      ),
    ],
  })
}
