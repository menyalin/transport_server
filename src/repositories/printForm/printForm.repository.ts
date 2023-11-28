import { PrintForm } from '../../domain/printForm/printForm.domain'
import { PrintFormModel } from './models/printForm.model'

class PrintFormRepository {
  async getByTemplateName(templateName: string): Promise<PrintForm | null> {
    return await PrintFormModel.findOne({ templateName }).lean()
  }

  async getTemplatesByTypeAndAgreement(
    docType: string,
    agreementId: string
  ): Promise<PrintForm[]> {
    const printForms = await PrintFormModel.find({
      agreement: agreementId,
      docType,
    }).lean()
    return printForms
  }
}

export default new PrintFormRepository()
