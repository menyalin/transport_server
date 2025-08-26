import { Document } from 'docx'
import { numbering, styles } from '@/shared/printForms'
import {
  commonDocTitleRowBuilder,
  commonDocHeaderTableBuilder,
  spacingParagraph,
  commonDocMainTableBuilder,
  commonDocResultTableBuilder,
  commonDocDescriptionBuilder,
} from '../fragments'
import {
  ICommonTitleRowProps,
  ICommonDocHeaderTableProps,
  ICommonDocMainTableProps,
  ICommonDocPaymentResultProps,
} from '../interfaces'
import { signatoriesTableBuilder } from './fragments'

export interface ISignatoriesFragmentProps {
  executorSignatoryPosition: string
  executorSignatoryName: string
  executorCompanyName: string
  customerCompanyName: string
}

export interface ICommonActData {
  titleData: ICommonTitleRowProps
  headerTable: ICommonDocHeaderTableProps
  mainTable: ICommonDocMainTableProps
  resultTable: ICommonDocPaymentResultProps
  signatories: ISignatoriesFragmentProps
  description: string
}

export const commonActDocumentBuilder = (data: ICommonActData): Document =>
  new Document({
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
