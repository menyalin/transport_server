import {
  ITableWidthProperties,
  WidthType,
  IIndentAttributesProperties,
  IBorderOptions,
} from 'docx'

export const noBorder: IBorderOptions = {
  style: 'none',
  size: 0,
  color: 'FFFFFF',
  space: 3,
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

export const sectionDividerBottom: IBorderOptions = {
  color: 'auto',
  space: 6,
  style: 'single',
  size: 15,
}
