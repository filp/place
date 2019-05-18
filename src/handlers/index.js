import theater from './theater'
import hue from './hue'
import cast from './cast'
import pihole from './pihole'
import network from './network'
import rules from './rules'
import bus from '../bus'

const all = [theater, hue, cast, pihole, network, rules]

export default {
  all,
  async collectState () {
    let state = {}

    for (const handler of all) {
      state[handler.name] = await handler.collectState()
    }

    bus.emit('home:state', state)

    return state
  }
}
