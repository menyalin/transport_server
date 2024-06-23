import {
  AlignmentType,
  HeightRule,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import { IOkAktBuilderProps } from '../shared/interfaces'

export const okActMainTableBuilder = (p: IOkAktBuilderProps): Table =>
  new Table({
    width: {
      size: 90,
      type: WidthType.PERCENTAGE,
    },
    margins: {
      bottom: 2000,
    },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        height: { value: 400, rule: HeightRule.AUTO },
        tableHeader: true,

        children: [
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0 },
            children: [
              new Paragraph({
                text: 'Наименование услуг',
                style: 'wihtoutIndent',
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0 },
            children: [
              new Paragraph({
                text: 'Единица измерения',
                style: 'wihtoutIndent',
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0 },
            children: [
              new Paragraph({
                text: 'Общая стоимость перевозки, рублей, включая НДС',
                style: 'wihtoutIndent',
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            margins: { top: 0, bottom: 0 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                text: 'Сумма НДС, рублей',
                style: 'wihtoutIndent',
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),

      new TableRow({
        height: { value: 300, rule: HeightRule.AUTO },
        children: [
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0 },
            children: [
              new Paragraph({
                text:
                  'Услуги по перевозке грузов с ' +
                  p.startPeriod +
                  ' по ' +
                  p.endPeriod,
                style: 'wihtoutIndent',
                alignment: AlignmentType.LEFT,
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0 },
            children: [
              new Paragraph({ text: 'Ставка', style: 'wihtoutIndent' }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0 },
            children: [
              new Paragraph({ text: p.totalSum, style: 'wihtoutIndent' }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0 },
            children: [
              new Paragraph({ text: p.vatSum, style: 'wihtoutIndent' }),
            ],
          }),
        ],
      }),

      new TableRow({
        height: { value: 300, rule: HeightRule.AUTO },

        children: [
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0 },
            columnSpan: 2,
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Итого:', bold: true })],
                style: 'wihtoutIndent',
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),

          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: p.totalSum, bold: true })],
                style: 'wihtoutIndent',
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: p.vatSum, bold: true })],
                style: 'wihtoutIndent',
              }),
            ],
          }),
        ],
      }),
    ],
  })
