import { mkdirSync } from 'fs'
import { rm } from 'fs/promises'
import XLSX from 'xlsx'
import moment from 'moment'

class FileService {
  constructor() {
    try {
      mkdirSync('static/tmp')
    } catch (e) {}
  }

  async createFileLink({ data, reportName }) {
    const wb = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, worksheet, 'report')
    const fileName = moment().format('YYYY_MM_DD_HH_mm_ss') + '_' + reportName
    const link = `static/tmp/${fileName}.xlsx`
    await XLSX.writeFileXLSX(wb, link)
    this.autoremove({ filename: link })
    return link
  }

  autoremove({ filename, timeout }) {
    setTimeout(() => {
      rm(filename)
        .then()
        .catch((e) => console.log(e))
    }, timeout || 1000 * 60)
  }
}

export default new FileService()
