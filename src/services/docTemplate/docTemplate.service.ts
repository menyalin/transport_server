// @ts-nocheck
import mongoose from 'mongoose'
import { DocTemplate } from '../../models/index.js'

class DocTemplateService {
  constructor({ docTemplateModel }) {
    this.docTemplateModel = docTemplateModel
  }

  async getAllowedTemplates({ client, company, type }) {
    const templates = await this.docTemplateModel.aggregate([
      {
        $match: {
          $expr: {
            $or: [
              { $eq: [0, { $size: '$companies' }] },
              {
                $and: [
                  { $in: [mongoose.Types.ObjectId(company), '$companies'] },
                  {
                    $or: [
                      { $eq: [0, { $size: '$clients' }] },
                      { $in: [mongoose.Types.ObjectId(client), '$clients'] },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    ])
    return templates
  }
}

export default new DocTemplateService({ docTemplateModel: DocTemplate })
