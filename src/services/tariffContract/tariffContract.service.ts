import { EventBus } from 'ts-bus'
import { bus } from '../../eventBus'
import { IEmitTo, NotifyClientsEvent } from '@/socket/notifyClientsEvent'
import { emitTo } from '../../socket/index'
import {
  TariffContract,
  TariffContractCreatedEvent,
  TARIFF_CONTRACT_EVENTS,
} from '@/domain/tariffContract'
import { TariffContractRepository } from '@/repositories'
import { ChangeLogService } from '@/services'

interface props {
  bus: EventBus
  emitter: typeof emitTo
  repository: typeof TariffContractRepository
  logService: typeof ChangeLogService
}

class TariffContractService {
  modelName: string = 'tariffContract'
  bus: EventBus
  repository: typeof TariffContractRepository
  logService: typeof ChangeLogService
  emitter: typeof emitTo
  constructor({ bus, emitter, repository, logService }: props) {
    this.emitter = emitter
    this.bus = bus
    this.repository = repository
    this.logService = logService
  }

  async create(body: any, user: string): Promise<TariffContract> {
    const contract: TariffContract = await this.repository.createOne(body)
    this.emitter(contract.company, TARIFF_CONTRACT_EVENTS.created, contract)
    this.bus.publish(TariffContractCreatedEvent(contract))
    await this.logService.add({
      docId: contract._id,
      coll: this.modelName,
      opType: 'create',
      user,
      company: contract.company,
      body: contract,
    })

    return contract
  }
}

export default new TariffContractService({
  bus,
  emitter: emitTo,
  repository: TariffContractRepository,
  logService: ChangeLogService,
})
