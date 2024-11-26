import { AlignmentType, LevelFormat } from 'docx'

export const mainNumbering = () => ({
  config: [
    {
      reference: 'main-numbering',
      levels: [
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: '%1',
          alignment: AlignmentType.START,
          style: {
            paragraph: {
              indent: {
                hanging: 400,
                start: 200,
                left: 200,
                firstLine: 400,
              },
              spacing: { after: 150, line: 250 },
            },
          },
        },
      ],
    },
  ],
})
