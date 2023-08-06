import { UnionTariffType } from '../../domain/tariff/tariff.domain'
import { Tariff as TariffModel } from '../../models'
import { Tariff as TariffDomain } from '../../domain/tariff/tariff.domain'

class TariffRepository {
  async create(props: UnionTariffType[]): Promise<UnionTariffType[]> {
    if (!Array.isArray(props))
      throw new Error('TariffRepository : create : prop must be an array')
    const data = await TariffModel.create<UnionTariffType>(props)
    return Array.isArray(data) ? data : [data]
  }
}
export default new TariffRepository()
