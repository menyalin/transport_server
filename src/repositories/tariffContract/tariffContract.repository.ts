import {
  TariffContract,
  TariffContractUpdatedEvent,
} from '@/domain/tariffContract'
import { TariffContractModel } from './models/tariffRepository.model'
import { bus } from '@/eventBus'
import { ListQueryPropsDto } from './dto/listQueryProps.dto'
import { ListPipelineBuilder } from './pipelines/getList'
import { Agreement } from '@/domain/agreement/agreement.domain'
import dayjs from 'dayjs'
import { TtlMap } from '@/utils/ttlMap'

class TariffContractRepository {
  contractsByAgreementAndDateMap: TtlMap<string, TariffContract[]>

  constructor() {
    this.contractsByAgreementAndDateMap = new TtlMap(1000 * 60 * 5)
    bus.subscribe(TariffContractUpdatedEvent, async ({ payload }) => {
      this.contractsByAgreementAndDateMap.clear()
      await this.updateOne(payload)
    })
  }
  private keyOfAgreementAndDate(agreement: Agreement, date: Date): string {
    return `${agreement._id}:${date.toISOString()}`
  }

  async createOne(body: any): Promise<TariffContract> {
    const res = await TariffContractModel.create(body)
    return new TariffContract(res)
  }

  async getById(id: string): Promise<TariffContract> {
    const res = await TariffContractModel.findById(id)
    return new TariffContract(res)
  }

  async updateOne(contract: TariffContract): Promise<void> {
    await TariffContractModel.findByIdAndUpdate(contract._id, contract)
  }

  async getByAgreementAndDate(
    agreement: Agreement,
    orderDate: Date
  ): Promise<TariffContract[]> {
    if (!agreement || !orderDate) return []
    const date: Date = dayjs(orderDate).startOf('day').toDate()
    const key = this.keyOfAgreementAndDate(agreement, date)

    if (this.contractsByAgreementAndDateMap.has(key))
      return this.contractsByAgreementAndDateMap.get(key) || []

    const data = await TariffContractModel.find({
      agreement: agreement._id,
      startDate: { $lte: date },
      $or: [{ endDate: { $gt: date } }, { endDate: { $eq: null } }],
    }).lean()

    const contracts = data.map((i) => new TariffContract(i))
    this.contractsByAgreementAndDateMap.set(key, contracts)
    return contracts
  }

  async getList(listOptions: any) {
    const propsDto = new ListQueryPropsDto(listOptions)
    const pipeline = ListPipelineBuilder(propsDto)
    const res = await TariffContractModel.aggregate(pipeline)
    return {
      items: res[0]?.items ?? [],
      count: res[0]?.count[0]?.count ?? 0,
    }
  }
}

export default new TariffContractRepository()
