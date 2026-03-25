import { Table, TableRow, WidthType } from 'docx'

export const mainTableWrapperBuilder = (rows: TableRow[]): Table => {
  return new Table({
    margins: {
      left: 50,
    },
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows,
  })
}
