import config from 'config'
import { DeviceMonitor } from 'castv2-device-monitor'
import bus from '../bus'

const cast = new DeviceMonitor(config.get('cast.device'))
const deviceTypeName = 'Chromecast'

let media = null
let application = null
let state = null
let idle = true

cast.on('media', m => {
  media = m
  bus.emit('cast:media', { application, media })
})

cast.on('application', a => {
  application = a
  bus.emit('cast:application', { application })
})

cast.on('playState', s => {
  state = s
  bus.emit(`cast:${s}`, { application, media })
})

cast.on('powerState', s => {
  idle = s === 'off'

  if (s === 'off') {
    bus.emit(`cast:idle`)
  }
})

export default {
  name: 'cast',
  async collectState () {
    return {
      media, application, state, playing: state === 'play', idle
    }
  }
}
