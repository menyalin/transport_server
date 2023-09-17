import { EventBus, createEventDefinition } from 'ts-bus'
import { bus } from '../eventBus'
import { emitTo } from './index'

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
  bus: EventBus
  emitter: typeof emitTo
  constructor({ bus, emitter }: { bus: EventBus; emitter: typeof emitTo }) {
    this.bus = bus
    this.emitter = emitter
    this.bus.subscribe(NotifyClientsEvent, (e) => this.publishEvent(e.payload))
  }

  publishEvent(e: IEmitTo) {
    this.emitter(e.subscriber, e.topic, e.payload)
  }
}

export default new NotifyClientsService({ bus, emitter: emitTo })
