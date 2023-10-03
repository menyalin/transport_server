import { createEventDefinition } from 'ts-bus'

export interface IEmitTo {
  subscriber: string
  topic: string
  payload?: any
}

export enum NOTIFY_CLIENTS_EVENTS {
  publish = 'NOTIFY_CLIENTS:publish',
}

export const NotifyClientsEvent = createEventDefinition<IEmitTo>()(
  NOTIFY_CLIENTS_EVENTS.publish
)
