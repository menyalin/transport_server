import {
  AlignmentType,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
} from 'docx'
import { noBorder } from '../../sharedFragments'
import { ITitleRowFragmentProps } from '../interfaces'

export const tableTitleRowsBuilder = (
  props: ITitleRowFragmentProps
): TableRow[] => {
  const firstRowCells: TableCell[] = [
    'Транспортная накладная',
    'Заказ (заявка)',
  ].map((title) => {
    return new TableCell({
      width: {
        size: 50,
        type: WidthType.PERCENTAGE,
      },
      children: [
        new Paragraph({
          text: title,
          alignment: AlignmentType.CENTER,
        }),
      ],
    })
  })

  const innerTableForTitleCell = (num: string = '', date: string = ''): Table =>
    new Table({
      borders: {
        bottom: noBorder,
        top: noBorder,
        right: noBorder,
        left: noBorder,
      },
      // margins: {
      //   left: 50,
      // },

      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: '6pc' },
              children: [new Paragraph('Дата')],
            }),
            new TableCell({
              width: { size: '40pc' },
              children: [new Paragraph(date)],
            }),
            new TableCell({
              width: { size: '6pc' },
              children: [new Paragraph('№')],
            }),
            new TableCell({
              width: { size: '40pc' },
              children: [new Paragraph(num)],
            }),
          ],
        }),
      ],
    })

  const rowWithDateAndNumberBulder = ({
    number,
    date,
  }: ITitleRowFragmentProps): TableRow => {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            innerTableForTitleCell(number, date.toLocaleDateString('ru')),
          ],
        }),
        new TableCell({
          children: [innerTableForTitleCell()],
        }),
      ],
    })
  }

  return [
    new TableRow({
      children: [...firstRowCells],
    }),
    rowWithDateAndNumberBulder(props),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Экземпляр №  1')],
        }),
        new TableCell({
          children: [],
        }),
      ],
    }),
  ]
}
