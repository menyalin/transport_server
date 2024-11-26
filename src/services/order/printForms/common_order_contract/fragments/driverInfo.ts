import { Paragraph, TextRun, UnderlineType } from 'docx'
import { BLOCK_SPACE } from '../config'

export const driverInfo = (): Paragraph => {
  return new Paragraph({
    spacing: {
      before: BLOCK_SPACE,
    },
    children: [
      new TextRun({
        text: 'Водитель: Щур Анатолий Николаевич',
        bold: true,
        underline: { type: UnderlineType.SINGLE },
      }),
      new TextRun({
        text: 'Паспорт: 1810 №486629, Отделом УФМС России по Волгоградской области в гор. Камышине, 17.10.2010,',
        break: 2,
      }),
      new TextRun({
        text: 'Тел.: 89608899152',
        break: 1,
      }),
      new TextRun({
        text: 'Гос. номер транспортного средства: Х046ОМ797, ХХ606077',
        break: 1,
      }),
    ],
  })
}
