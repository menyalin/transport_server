import { bus } from '../eventBus'
import { emitTo } from './index'
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

class NotifyClientsService {
  constructor() {
    bus.subscribe(NotifyClientsEvent, (e) => {
      try {
        this.publish(e.payload)
      } catch (e) {
        console.log('NotifyClientsService: error ', e)
      }
    })
  }
  publish(e: IEmitTo) {
    emitTo(e.subscriber, e.topic, e.payload)
  }
}

export default new NotifyClientsService()
