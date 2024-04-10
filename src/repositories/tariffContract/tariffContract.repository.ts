import {
  TariffContract,
  TariffContractUpdatedEvent,
} from '@/domain/tariffContract'
import { TariffContractModel } from './models/tariffRepository.model'
import { bus } from '@/eventBus'
import { ListQueryPropsDto } from './dto/listQueryProps.dto'
import { ListPipelineBuilder } from './pipelines/getList'

class TariffContractRepository {
  constructor() {
    bus.subscribe(TariffContractUpdatedEvent, async ({ payload }) => {
      await this.updateOne(payload)
    })
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
