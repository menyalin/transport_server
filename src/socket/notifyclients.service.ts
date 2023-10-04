import { EventBus } from 'ts-bus'
import { bus } from '../eventBus'
import { emitTo } from './index'
import { IEmitTo, NotifyClientsEvent } from './notifyClientsEvent'

class NotifyClientsService {
  bus: EventBus
  emitter: typeof emitTo
  constructor({ bus, emitter }: { bus: EventBus; emitter: typeof emitTo }) {
    this.bus = bus
    this.emitter = emitter
    this.bus.subscribe(NotifyClientsEvent, (e) => {
      this.publishEvent(e.payload)
    })
  }

  publishEvent(e: IEmitTo) {
    this.emitter(e.subscriber, e.topic, e.payload)
  }
}

export default new NotifyClientsService({ bus, emitter: emitTo })
