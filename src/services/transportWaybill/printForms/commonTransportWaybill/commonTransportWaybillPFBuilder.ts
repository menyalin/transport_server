import { TransportWaybill } from '@/domain/transportWaybill'
import { Document, Packer } from 'docx'
import { numbering, styles } from '@/shared/printForms'
import { dataBuilder } from './dataBuilder'
import {
  formHeaderBuilder,
  mainTableWrapperBuilder,
  tableTitleRowsBuilder,
  shipperFragmentBuilder,
} from './fragments'

export const commonTransportWaybillPFBuilder = async (
  waybill: TransportWaybill
): Promise<Buffer> => {
  const data = await dataBuilder(waybill)
  const doc = new Document({
    numbering: numbering.mainNumbering(),
    styles: {
      default: {
        ...styles.defaultDocStyles,
        document: { run: { size: '8pt', font: 'Arial' } },
      },
      paragraphStyles: [
        {
          id: 'formHeader',
          name: 'Form Header',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            size: '6pt',
            font: 'Arial',
          },
          paragraph: {
            alignment: 'right',
          },
        },
      ],
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
          ...formHeaderBuilder(),
          mainTableWrapperBuilder([
            ...tableTitleRowsBuilder(data.title),
            ...shipperFragmentBuilder(data.shipper),
          ]),
        ],
      },
    ],
  })
  return await Packer.toBuffer(doc)
}
