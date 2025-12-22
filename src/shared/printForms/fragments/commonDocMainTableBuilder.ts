import {
  AlignmentType,
  IBorderOptions,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'

import { ICommonDocMainTableProps } from '../interfaces'

import { TotalPrice } from '@/domain/commonInterfaces'
import { FullOrderDataDTO } from '@/domain/order/dto/fullOrderData.dto'
import { ICommonDocMainTableRowProps } from '@/shared/printForms/interfaces'
import { moneyFormatter } from '@/utils/moneyFormatter'
import { minCellWidth, paragraphCellIntent, priceCellWidth } from './constants'

export const commonDocMainTableRowBuilder = (
  orderData: FullOrderDataDTO,
  totalPrice: TotalPrice
): ICommonDocMainTableRowProps => {
  const rowPrefix = 'Транспортные услуги по маршруту'
  const routeAdresses: string = orderData.fullAddressesRouteString

  return {
    title: `${rowPrefix} ${routeAdresses}; водитель ${orderData.shortDriverName} а/м ${orderData.truckBrand} ${orderData.truckNum} ${orderData.plannedDate.slice(0, 10)}`,
    measurementUnit: 'шт.',
    count: '1',
    price: moneyFormatter(totalPrice.price),
    sum: moneyFormatter(totalPrice.price),
  }
}

export const commonDocMainTableBuilder = (
  props: ICommonDocMainTableProps
): Table => {
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
        props.mainColumnTitle ?? 'Наименование',
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
