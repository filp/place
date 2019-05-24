import config from 'config'
import bus from '../bus'
import logger from '../logger'

let activeModules = []
const availableModules = [
  'theater',
  'hue',
  'cast',
  'pihole',
  'network',
  'rules',
  'pushover'
]

// Dynamically load only modules described in configuration
for (const moduleName of availableModules) {
  if (config[moduleName]) {
    const mod = require(`./${moduleName}`)
    activeModules.push(mod)

    logger.info({ moduleName }, 'enabled module')
    bus.emit('module:enable', mod)
  }
}

export default {
  async collectState () {
    let state = {}

    for (const handler of activeModules) {
      state[handler.default.name] = await handler.default.collectState()
    }

    bus.emit('home:state', state)

    return state
  }
}
