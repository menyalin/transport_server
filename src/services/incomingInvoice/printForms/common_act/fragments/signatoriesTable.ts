import { Table, WidthType } from 'docx'
import { ISignatoriesFragmentProps } from '../interfaces'
import { noBorder } from './constants'

export const signatoriesTableBuilder = (
  props: ISignatoriesFragmentProps
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
    rows: [],
  })
}
