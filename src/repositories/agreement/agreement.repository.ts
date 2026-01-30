import { Agreement } from '@/domain/agreement/agreement.domain'
import { Agreement as AgreementModel } from '@/models'
import { TtlMap } from '@/utils/ttlMap'

interface IProps {
  model: typeof AgreementModel
}

class AgreementRepository {
  model: typeof AgreementModel
  private cache: TtlMap<string, Agreement | null>

  constructor({ model }: IProps) {
    this.model = model
    this.cache = new TtlMap(5 * 60 * 1000) // 5 минут
  }

  async getById(id: string): Promise<Agreement | null> {
    const cached = this.cache.get(id)
    if (cached !== undefined) {
      return cached
    }

    const doc = await this.model.findById(id)
    const result = doc ? new Agreement(doc) : null

    this.cache.set(id, result)
    return result
  }

  async getByIds(ids: string[]): Promise<Agreement[]> {
    const docs = await this.model.find({ _id: { $in: ids } })
    return docs.map((doc) => new Agreement(doc))
  }
}

export default new AgreementRepository({ model: AgreementModel })
