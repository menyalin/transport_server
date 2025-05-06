import {
  IBorderOptions,
  IIndentAttributesProperties,
  ITableWidthProperties,
  WidthType,
} from 'docx'

export const noBorder: IBorderOptions = {
  style: 'none',
  size: 0,
  color: 'FFFFFF',
  space: 0,
}

export const hiddenAllBorders = {
  bottom: noBorder,
  top: noBorder,
  left: noBorder,
  right: noBorder,
  insideHorizontal: noBorder,
  insideVertical: noBorder,
}

export const minCellWidth: ITableWidthProperties = {
  size: 600,
  type: WidthType.DXA,
}

export const priceCellWidth: ITableWidthProperties = {
  size: 1200,
  type: WidthType.DXA,
}

export const paragraphCellIntent: IIndentAttributesProperties = {
  left: 30,
  right: 30,
}
