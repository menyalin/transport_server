import { AlignmentType, IStylesOptions } from 'docx'

export const defaultDocStyles: IStylesOptions['default'] = {
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
