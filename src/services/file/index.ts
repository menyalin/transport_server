// @ts-nocheck
import { Readable } from 'stream'
import * as XLSX from 'xlsx'
import HTMLtoDOCX from 'html-to-docx'
import { DocumentOptions } from '@types/html-to-docx'

class FileService {
  async createExcelFile(data: unknown[]): Promise<Readable> {
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, worksheet, 'report')
    const excelFile: Buffer = XLSX.write(wb, {
      type: 'buffer',
      bookType: 'xlsx',
    })
    return Readable.from(excelFile)
  }

  async createWordFileFromHtml(
    htmlString: string,
    options: DocumentOptions
  ): Promise<Buffer> {
    const docxBuffer = await HTMLtoDOCX(htmlString, '', options)
    return docxBuffer
  }
}

export default new FileService()
