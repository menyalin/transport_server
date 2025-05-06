import { numbering, styles } from '@/shared/printForms'
import { Packer, Document } from 'docx'
import { incomingInvoiceDataBuilder } from './dataBuilder'
import { signatoriesTableBuilder } from './fragments'
import {
  commonDocHeaderTableBuilder,
  commonDocMainTableBuilder,
  spacingParagraph,
  commonDocTitleRowBuilder,
  commonDocResultTableBuilder,
  commonDocDescriptionBuilder,
} from '@/shared/printForms/fragments'

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
          commonDocTitleRowBuilder(data.titleData),
          commonDocHeaderTableBuilder(data.headerTable),
          spacingParagraph(150),
          commonDocMainTableBuilder(data.mainTable),
          spacingParagraph(90),
          commonDocResultTableBuilder(data.resultTable),
          spacingParagraph(300),
          commonDocDescriptionBuilder(data.description),
          spacingParagraph(300),
          signatoriesTableBuilder(data.signatories),
        ],
      },
    ],
  })
  return await Packer.toBuffer(doc)
}
