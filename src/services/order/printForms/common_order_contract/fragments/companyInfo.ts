import { ICarreierPFData } from '@/domain/carrier/interfaces'
import { Paragraph, TextRun } from 'docx'

export const companyInfo = (p: ICarreierPFData): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({
        text: p.fullName,
        bold: true,
      }),
      new TextRun({
        text: p.legalAddress,
        break: 2,
      }),
      new TextRun({
        text: `ИНН / КПП: ${p.inn} / ${p.kpp}`,
        break: 1,
      }),
      p.ogrn
        ? new TextRun({
            text: `ОГРН: ${p.ogrn}`,
            break: 1,
          })
        : new TextRun({
            text: ``,
          }),
      p.ogrnip
        ? new TextRun({
            text: `ОГРНИП: ${p.ogrnip}`,
            break: 1,
          })
        : new TextRun({
            text: ``,
          }),

      new TextRun({
        text: `P/c: ${p.bankInfo?.accountNumber}`,
        break: 1,
      }),
      new TextRun({
        text: p.bankInfo?.bankName,
        break: 1,
      }),
      new TextRun({
        text: `БИК: ${p.bankInfo?.bankCode}`,
        break: 1,
      }),
      new TextRun({
        text: `К/с: ${p.bankInfo?.correspondentAccount}`,
        break: 1,
      }),
    ],
  })
}
