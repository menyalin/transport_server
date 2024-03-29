import { TariffContract } from '@/domain/tariffContract'
import { TariffContractModel } from './models/tariffRepository.model'

class TariffContractRepository {
  async createOne(body: any): Promise<TariffContract> {
    const res = await TariffContractModel.create(body)
    return new TariffContract(res)
  }
}

export default new TariffContractRepository()
