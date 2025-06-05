import { PrintForm } from '@/domain/printForm/printForm.domain'
import { PrintFormModel } from './models/printForm.model'

class PrintFormRepository {
  async getByTemplateName(templateName: string): Promise<PrintForm | null> {
    return await PrintFormModel.findOne({ templateName }).lean()
  }
  async getTemplatesByType({
    docType,
  }: {
    docType: string
  }): Promise<PrintForm[]> {
    const printForms = await PrintFormModel.find({ docType }).lean()
    return printForms
  }

  async getTemplatesByTypeAndAgreement(
    docType: string,
    agreementId: string,
    clientId: string | null = null
  ): Promise<PrintForm[]> {
    const printForms = await PrintFormModel.find({
      $and: [
        {
          $or: [{ client: { $exists: false } }, { client: clientId }],
        },
        {
          $or: [{ agreement: { $exists: false } }, { agreement: agreementId }],
        },
      ],
      docType,
    }).lean()
    return printForms
  }
}

export default new PrintFormRepository()
