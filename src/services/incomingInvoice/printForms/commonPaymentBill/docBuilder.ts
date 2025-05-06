import { numbering, styles } from '@/shared/printForms'
import { Packer, Document } from 'docx'

import { commonPaymentBillDataBuilder } from './dataBuilder'
import { commonDocTitleRowBuilder } from '@/shared/printForms/fragments/commonDocTitleRowBuilder'
import {
  commonDocDescriptionBuilder,
  commonDocHeaderTableBuilder,
  commonDocResultTableBuilder,
  spacingParagraph,
} from '@/shared/printForms/fragments'
import { commonDocMainTableBuilder } from '@/shared/printForms/fragments/commonDocMainTableBuilder'
import { signatoriesTableBuilder } from './fragments/signatoriesTable'
import { bankAccountTableBuilder } from './fragments/bankAccountTable'

export const commonPaymentBillBuilder = async (
  invoiceId: string
): Promise<Buffer> => {
  const data = await commonPaymentBillDataBuilder(invoiceId)

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
          bankAccountTableBuilder(data.bankInfoTable),
          spacingParagraph(300),
          commonDocTitleRowBuilder(data.titleData),
          commonDocHeaderTableBuilder(data.headerTable),
          spacingParagraph(),
          commonDocMainTableBuilder(data.mainTableData),
          spacingParagraph(90),
          commonDocResultTableBuilder(data.resultTable),
          // spacingParagraph(90),
          commonDocDescriptionBuilder(data.description),
          spacingParagraph(600),
          signatoriesTableBuilder(data.signatories),
        ],
      },
    ],
  })
  return await Packer.toBuffer(doc)
}
