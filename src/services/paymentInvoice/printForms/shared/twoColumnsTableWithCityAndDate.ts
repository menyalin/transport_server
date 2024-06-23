import {
  AlignmentType,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  WidthType,
} from 'docx'

export const twoColumnsTableWithCityAndDate = (
  city: string,
  dateStr: string
): Table =>
  new Table({
    borders: TableBorders.NONE,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: city,

                alignment: AlignmentType.LEFT,
                indent: { firstLine: 0 },
              }),
            ],
            borders: TableBorders.NONE,
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: dateStr,
                alignment: AlignmentType.RIGHT,
                indent: { firstLine: 0 },
              }),
            ],
            borders: TableBorders.NONE,
          }),
        ],
      }),
    ],
  })
