import {
  AlignmentType,
  BorderStyle,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  VerticalAlign,
  WidthType,
} from 'docx'

export const signatoryCell = ({
  position,
  name,
}: {
  position: string
  name: string
}): Table =>
  new Table({
    borders: TableBorders.NONE,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                text: position,
                alignment: AlignmentType.LEFT,
                indent: { firstLine: 0 },
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            borders: {
              bottom: {
                style: BorderStyle.SINGLE,
                size: 1,
              },
            },
            children: [
              new Paragraph({
                text: `/${name}`,
                alignment: AlignmentType.RIGHT,
                indent: { firstLine: 0 },
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            margins: {
              top: 100,
            },
            columnSpan: 2,

            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                text: 'М.П.',
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
    ],
  })
