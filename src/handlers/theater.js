import config from 'config'
import bus from '../bus'
import { setGroupStateByName } from './hue'

let lastPayload = null

const theaterConfig = config.get('theater')
const schedule = theaterConfig.schedule.split('-').map(h => +h)

bus.on('plex:media.pause', handleTheaterState)
bus.on('plex:media.stop', handleTheaterState)
bus.on('plex:media.resume', handleTheaterState)

function isTheaterPlayer (payload) {
  return payload.Player.title === theaterConfig.plex.player
}

function isWithinSchedule () {
  const now = new Date()
  const hour = now.getHours()

  return hour >= schedule[0] && hour < schedule[1]
}

function lastPlayedMedia () {
  if (!lastPayload) return null

  return {
    player: {
      user: lastPayload.Account.title,
      machine: lastPayload.Player.title
    },
    meta: {
      title: lastPayload.Metadata.title,
      tagline: lastPayload.Metadata.tagline,
      duration: lastPayload.Metadata.duration,
      type: lastPayload.Metadata.type,
      rating: lastPayload.Metadata.rating,
      audienceRating: lastPayload.Metadata.audienceRating,
      summary: lastPayload.Metadata.summary,
      year: lastPayload.Metadata.year,
      viewOffset: lastPayload.Metadata.viewOffset,
      lastViewedAt: lastPayload.Metadata.lastViewedAt
    }
  }
}

async function setLights (actionConfig) {
  if (!actionConfig) return

  return setGroupStateByName(
    actionConfig.group,
    actionConfig.state
  )
}

async function handleTheaterState (payload) {
  const event = payload.event
  const active = event === 'media.resume'

  if (active) {
    lastPayload = payload
  }

  if (!isTheaterPlayer(payload)) return
  if (!isWithinSchedule()) return

  await setLights(active ? theaterConfig.start : theaterConfig.stop)
}

export default {
  name: 'theater',
  async collectState () {
    return {
      inSchedule: isWithinSchedule(),
      lastMedia: lastPlayedMedia(),
      config: theaterConfig
    }
  }
}
