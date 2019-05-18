import { promisify } from 'util'
import networkList from 'network-list'
import config from 'config'
import bus from '../bus'

const macMap = config.network.deviceNames
const scan = promisify(networkList.scan)

let lastScan = null
let activeScan = null
let transitions = null

bus.on(config.get('network.scanOn'), async () => {
  await scanNetworkClients()
})

function emitTransitionEvents (list, eventType) {
  list.forEach((d) => {
    bus.emit(`network:device:${eventType}`, d)

    if (d.details) {
      bus.emit(`network:device:${d.details.name}:${eventType}`, d)
    }
  })
}

function trackDeviceChanges () {
  // If we have nothing to compare to, do nothing
  if (!lastScan) return

  transitions = {
    enter: activeScan.filter(d => !lastScan.find(x => x.mac === d.mac)),
    exit: lastScan.filter(d => !activeScan.find(x => x.mac === d.mac))
  }

  emitTransitionEvents(transitions.enter, 'enter')
  emitTransitionEvents(transitions.exit, 'exit')
}

async function scanNetworkClients () {
  lastScan = activeScan
  activeScan = (await scan({})).filter(c => c.alive).map(c => {
    return {
      ip: c.ip,
      mac: c.mac,
      vendor: c.vendor,
      details: macMap[c.mac] || null
    }
  })

  trackDeviceChanges()

  bus.emit('network:scanned', activeScan)
  activeScan.forEach(d => {
    d.details && bus.emit(`network:device:${d.details.name}:present`)
  })
}

export default {
  name: 'network',
  async collectState () {
    return {
      devices: activeScan || [],
      transitions
    }
  }
}
