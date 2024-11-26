import { AlignmentType } from 'docx'
import { IDefaultStylesOptions } from 'docx/build/file/styles/factory'

export const defaultDocStyles: IDefaultStylesOptions = {
  heading1: {
    run: {
      size: '12pt',
    },

    paragraph: {
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 250,
      },
    },
  },

  document: {
    run: { size: '10pt', font: 'Arial' },
    paragraph: {
      indent: { firstLine: 500 },
      alignment: AlignmentType.LEFT,
    },
  },
}
