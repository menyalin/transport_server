import { numbering, styles } from '@/shared/printForms'
import { Packer, Document, Paragraph, TextRun } from 'docx'

import { incomingInvoiceDataBuilder } from './dataBuilder'
import {
  headerTableBuilder,
  mainTableBuilder,
  resultTableBuilder,
  rowTitleBuilder,
  descriptionBuilder,
  signatoriesTableBuilder,
} from './fragments'

const spacingParagraph = (lineHeight: number = 150): Paragraph =>
  new Paragraph({
    children: [new TextRun('')],
    spacing: {
      line: lineHeight,
    },
  })

export const commonActBuilder = async (invoiceId: string): Promise<Buffer> => {
  const data = await incomingInvoiceDataBuilder(invoiceId)
  const doc = new Document({
    numbering: numbering.mainNumbering(),
    styles: {
      default: {
        ...styles.defaultDocStyles,
        document: { run: { size: '8pt', font: 'Arial' } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 500,
              left: 600,
              right: 500,
              bottom: 500,
            },
          },
        },
        children: [
          rowTitleBuilder(data.titleData),
          headerTableBuilder(data.headerTable),
          spacingParagraph(150),
          mainTableBuilder(data.mainTable),
          spacingParagraph(90),
          resultTableBuilder(data.resultTable),
          spacingParagraph(300),
          descriptionBuilder(data.description),
          spacingParagraph(300),
          signatoriesTableBuilder(data.signatories),
        ],
      },
    ],
  })
  return await Packer.toBuffer(doc)
}
