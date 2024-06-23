import {
  AlignmentType,
  Document,
  HeadingLevel,
  LevelFormat,
  Paragraph,
  TextRun,
} from 'docx'
import { IOkAktBuilderProps } from '../shared/interfaces'
import { okActMainTableBuilder } from './mainTable'
import { okActSignatoriesTableBuilder } from './signatoriesTable'

import * as utils from '../shared'
import { headerBuilder } from './header'
export const formBuilder = (p: IOkAktBuilderProps): Document => {
  return new Document({
    numbering: {
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
                  indent: { left: 400, hanging: 300, firstLine: 600 },
                  spacing: { after: 250, line: 300 },
                },
              },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
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
      },
      paragraphStyles: [
        {
          id: 'wihtoutIndent',
          name: 'Wihtout Indent',
          basedOn: 'Normal',
          quickFormat: true,

          paragraph: {
            alignment: AlignmentType.CENTER,
            indent: {
              firstLine: 0,
              hanging: 0,
              left: 50,
              right: 50,
            },
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              left: 1200,
              right: 1000,
              bottom: 1000,
            },
          },
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `Акт № ${p.docNumber}`,
                bold: true,
              }),
            ],

            style: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: 'об оказании услуг по перевозке грузов',
            alignment: AlignmentType.CENTER,
            style: HeadingLevel.HEADING_1,
          }),
          utils.twoColumnsTableWithCityAndDate('г. Москва', p.date),
          headerBuilder(p.actHeaderFragments),
          new Paragraph({
            text:
              'В соответствии с заключенным между Исполнителем и Заказчиком Договором ' +
              p.contractNumber +
              ' от ' +
              p.contractDate +
              ' исполнитель принял на себя обязательство осуществлять доставку автомобильным транспортом вверенных ему Заказчиком грузов, ' +
              'а Заказчик принял на себя обязательство производить оплату услуг Исполнителя.',
            numbering: {
              reference: 'main-numbering',
              level: 0,
            },
            alignment: AlignmentType.THAI_DISTRIBUTE,
          }),
          new Paragraph({
            text:
              'За период с ' +
              p.startPeriod +
              ' по ' +
              p.endPeriod +
              ' Исполнитель осуществил доставку грузов по маршрутам, согласно прилагаемому реестру перевозок в Приложении №1 к настоящему Акту об оказании услуг по перевозке грузов.',
            numbering: {
              reference: 'main-numbering',
              level: 0,
            },
            alignment: AlignmentType.THAI_DISTRIBUTE,
          }),
          okActMainTableBuilder(p),
          new Paragraph({
            text:
              'Итого общая стоимость услуг по перевозке грузов на основании пункта 2 настоящего Акта составляет ' +
              p.totalSum +
              'руб., в т. ч. НДС ' +
              p.vatSum +
              'руб.',
            spacing: {
              before: 300,
            },
            numbering: {
              reference: 'main-numbering',
              level: 0,
            },
            alignment: AlignmentType.THAI_DISTRIBUTE,
          }),
          new Paragraph({
            text: 'По качеству предоставленных Исполнителем услуг Заказчик претензий не имеет.',
            numbering: {
              reference: 'main-numbering',
              level: 0,
            },
            alignment: AlignmentType.THAI_DISTRIBUTE,
          }),
          new Paragraph({
            text: 'Документы, подтверждающие выполнение услуг по перевозке грузов, согласно Приложению №7 настоящего Договора прилагаются в соответствии с реестром перевозок.',
            numbering: {
              reference: 'main-numbering',
              level: 0,
            },
            alignment: AlignmentType.THAI_DISTRIBUTE,
          }),
          new Paragraph({
            spacing: {
              before: 400,
              after: 300,
            },
            children: [
              new TextRun({
                text: 'Подписи сторон:',
                bold: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          okActSignatoriesTableBuilder(p.signatories),
        ],
      },
    ],
  })
}
