import { Agreement } from '@/domain/agreement/agreement.domain'
import { Agreement as AgreementModel } from '@/models'

interface IProps {
  model: typeof AgreementModel
}

class AgreementRepository {
  model: typeof AgreementModel

  constructor({ model }: IProps) {
    this.model = model
  }

  async getById(id: string): Promise<Agreement | null> {
    const doc = await this.model.findById(id)
    if (!doc) return null
    return new Agreement(doc)
  }

  async getByIds(ids: string[]): Promise<Agreement[]> {
    const docs = await this.model.find({ _id: { $in: ids } })
    return docs.map((doc) => new Agreement(doc))
  }
}

export default new AgreementRepository({ model: AgreementModel })
