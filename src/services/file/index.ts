import { Readable } from 'stream'
import * as XLSX from 'xlsx'

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
}

export default new FileService()
