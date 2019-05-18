import config from 'config'
import { DeviceMonitor } from 'castv2-device-monitor'
import bus from '../bus'

const cast = new DeviceMonitor(config.get('cast.device'))
const deviceTypeName = 'Chromecast'
const actLikePlex = config.get('cast.emulatePlex')
const ignoredApplications = config.get('cast.ignore')

let media = null
let application = null
let state = null
let idle = true

// From the available app and media information, create a mock plex event and emit it,
// but only if this is not an ignored application
function mockPlexEvent (eventType) {
  const payload = {
    event: eventType,
    Account: {
      title: 'home:cast'
    },

    Player: {
      title: deviceTypeName
    },
    Metadata: {
      title: media.title
    }
  }

  bus.emit(`plex:${eventType}`, payload)
}

function shouldActLikePlex () {
  return actLikePlex && ignoredApplications.indexOf(application) === -1
}

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

  if (shouldActLikePlex()) {
    const plexState = s === 'play' ? 'resume' : s
    mockPlexEvent(`media.${plexState}`)
  }
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
