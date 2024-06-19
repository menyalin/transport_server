import { TariffContract } from '@/domain/tariffContract'

export interface ITariffContractService {
  create(p: any): Promise<TariffContract>
  updateOne(p: any): Promise<TariffContract>
  getList(p: any): Promise<TariffContract[]>
}
