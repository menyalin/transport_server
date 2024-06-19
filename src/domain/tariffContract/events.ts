import { TariffContract } from './TariffContract'
import { createEventDefinition } from 'ts-bus'

export enum TARIFF_CONTRACT_EVENTS {
  created = 'tariffContract:created',
  updated = 'tariffContract:updated',
  deleted = 'tariffContract:deleted',
}

export const TariffContractCreatedEvent =
  createEventDefinition<TariffContract>()(TARIFF_CONTRACT_EVENTS.created)

export const TariffContractUpdatedEvent =
  createEventDefinition<TariffContract>()(TARIFF_CONTRACT_EVENTS.updated)

export const TariffContractDeletedEvent = createEventDefinition<{
  id: string
}>()(TARIFF_CONTRACT_EVENTS.deleted)
