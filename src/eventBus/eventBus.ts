// @ts-nocheck
import EventEmitter from 'events'

class EventBus extends EventEmitter {
  constructor() {
    super()
  }

  subscribe(eventName, listener) {
    this.on(eventName, listener)
  }

  emitEvent(eventName, eventData) {
    this.emit(eventName, eventData)
  }
}

export default new EventBus()
