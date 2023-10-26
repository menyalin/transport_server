import { IDefaultIdleTruckNotification } from '../notifications/interfaces'
import { Partner } from './partner.domain'

import { createEventDefinition } from 'ts-bus'

export enum PARTNER_DOMAIN_EVENTS {
  toUpdate = 'partner:toUpdate',
  updated = 'partner:update',
  toSendIdleTruckNotificationMessage = 'partner:toSendIdleTruckNotificationMessage',
  toCancelIdleTruckNotificationMessages = 'partner:toCancelIdleTruckNotificationMessagesEvent',
}

export const UpdatePartnerEvent = createEventDefinition<Partner>()(
  PARTNER_DOMAIN_EVENTS.toUpdate
)

export const toSendIdleTruckNotificationMessageEvent =
  createEventDefinition<IDefaultIdleTruckNotification>()(
    PARTNER_DOMAIN_EVENTS.toSendIdleTruckNotificationMessage
  )

export const toCancelIdleTruckNotificationMessagesEvent =
  createEventDefinition<string>()(
    PARTNER_DOMAIN_EVENTS.toCancelIdleTruckNotificationMessages
  )
