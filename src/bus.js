import EventEmitter from 'events'
import logger from './logger'

const allType = 'all'

class EventBus extends EventEmitter {
  emit (type, ...args) {
    if (type !== allType) {
      super.emit(allType, { event: type, args })
    }

    super.emit(type, ...args)
  }
}

const bus = new EventBus()

bus.on('all', e => {
  logger.info({ type: e.event }, 'event')
})

export default bus
