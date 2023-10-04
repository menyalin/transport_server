import { Partner } from './partner.domain'

import { createEventDefinition } from 'ts-bus'

export enum PARTNER_DOMAIN_EVENTS {
  toUpdate = 'partner:toUpdate',
  updated = 'partner:update',
}

export const UpdatePartnerEvent = createEventDefinition<Partner>()(
  PARTNER_DOMAIN_EVENTS.toUpdate
)
