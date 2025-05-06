import {
  BorderStyle,
  Paragraph,
  Tab,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import { IBankAccountTableProps } from '../interfaces'
import { noBorder } from '@/shared/printForms/fragments'
import { CompanyInfo } from '@/domain/companyInfo'
import { hiddenAllBorders } from '../../../../../shared/printForms/fragments/constants'

export const bankAccountTableBuilder = (
  props: IBankAccountTableProps
): Table => {
  const companyInfoCell = (p: CompanyInfo): Table =>
    new Table({
      width: { type: WidthType.PERCENTAGE, size: 100 },

      borders: hiddenAllBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: {
                type: WidthType.PERCENTAGE,
                size: 8,
              },
              borders: {
                right: noBorder,
              },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'ИНН', size: 18 })],
                }),
              ],
            }),
            new TableCell({
              width: {
                type: WidthType.AUTO,
                size: 100,
              },
              borders: {
                left: noBorder,
                right: {
                  style: BorderStyle.SINGLE,
                },
              },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: p.inn || '__', size: 18 })],
                }),
              ],
            }),
            new TableCell({
              width: {
                type: WidthType.PERCENTAGE,
                size: 8,
              },
              borders: {
                right: noBorder,
              },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'КПП', size: 18 })],
                }),
              ],
            }),
            new TableCell({
              width: {
                type: WidthType.AUTO,
                size: 100,
              },
              borders: {
                left: noBorder,
              },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: p.kpp || '__', size: 18 })],
                }),
              ],
            }),
          ],
        }),
      ],
    })

  return new Table({
    width: { type: WidthType.PERCENTAGE, size: 100 },
    rows: [
      // 1 строка
      new TableRow({
        children: [
          new TableCell({
            width: { type: WidthType.PERCENTAGE, size: 55 },
            borders: {
              bottom: noBorder,
            },
            rowSpan: 2,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: props.bankInfo?.bankName || '__',
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { type: WidthType.PERCENTAGE, size: 8 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'БИК', size: 18 })],
              }),
            ],
          }),
          new TableCell({
            width: { type: WidthType.AUTO, size: 0 },
            borders: { bottom: noBorder },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: props.bankInfo?.bankCode || '__',
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      // 2 строка
      new TableRow({
        children: [
          new TableCell({
            rowSpan: 2,
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Сч. №', size: 18 })],
              }),
            ],
          }),
          new TableCell({
            rowSpan: 2,
            borders: {
              top: noBorder,
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: props.bankInfo?.correspondentAccount || '__',
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      // 3 строка
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: noBorder,
            },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Банк получателя' })],
              }),
            ],
          }),
        ],
      }),
      // 4 строка
      new TableRow({
        children: [
          new TableCell({
            children: [companyInfoCell(props.companyInfo)],
          }),
          new TableCell({
            rowSpan: 4,
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Сч. №', size: 18 })],
              }),
            ],
          }),
          new TableCell({
            rowSpan: 4,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: props.bankInfo?.accountNumber || '__',
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      // 5 строка
      new TableRow({
        children: [
          new TableCell({
            rowSpan: 2,
            borders: {
              bottom: noBorder,
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: props.companyInfo?.fullName || '',
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      // 6 строка (пустая)
      new TableRow({
        children: [],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: noBorder,
            },
            children: [
              new Paragraph({
                text: 'Получатель',
              }),
            ],
          }),
        ],
      }),
    ],
  })
}
