import config from 'config'
import bus from '../bus'

let lastPayload = null

const theaterConfig = config.get('theater')

bus.on('plex:media:pause', handleTheaterState)
bus.on('plex:media:stop', handleTheaterState)
bus.on('plex:media:resume', handleTheaterState)
bus.on('plex:media:start', handleTheaterState)

function isTheaterPlayer (payload) {
  return payload.Player.title === theaterConfig.plex.player
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

async function handleTheaterState (payload) {
  const event = payload.event
  const active = event === 'media.resume'

  if (active) {
    lastPayload = payload
  }

  if (!isTheaterPlayer(payload)) return
  bus.emit(`theater:${event.replace('.', ':')}`, payload)
}

export default {
  name: 'theater',
  async collectState () {
    return {
      lastMedia: lastPlayedMedia()
    }
  }
}
