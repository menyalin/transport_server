import { DocTemplate } from '@/models'
import { isValidObjectId, PipelineStage, Types } from 'mongoose'

interface IProps {
  docTemplateModel: typeof DocTemplate
}

class DocTemplateService {
  docTemplateModel: typeof DocTemplate
  constructor({ docTemplateModel }: IProps) {
    this.docTemplateModel = docTemplateModel
  }

  async getAllowedTemplates({
    client,
    company,
    agreement,
  }: {
    client: string
    company: string
    type: string
    agreement?: string
  }) {
    const tmpAgreement: Types.ObjectId | null =
      agreement && isValidObjectId(agreement)
        ? new Types.ObjectId(agreement)
        : null

    const matcher: PipelineStage.Match = {
      $match: {
        $expr: {
          $or: [
            { $eq: [0, { $size: '$companies' }] },
            {
              $and: [
                { $in: [new Types.ObjectId(company), '$companies'] },
                {
                  $or: [
                    { $eq: [0, { $size: '$clients' }] },
                    { $in: [new Types.ObjectId(client), '$clients'] },
                  ],
                },
                {
                  $or: [
                    { $eq: [{ $ifNull: ['$agreement', null] }, null] },
                    { $eq: [{ $ifNull: ['$agreement', null] }, tmpAgreement] },
                  ],
                },
              ],
            },
          ],
        },
      },
    }

    const templates = await this.docTemplateModel.aggregate([matcher])
    return templates
  }
}

export default new DocTemplateService({ docTemplateModel: DocTemplate })
