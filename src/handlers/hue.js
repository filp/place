import { HueApi, lightState } from 'node-hue-api'
import config from 'config'
import bus from '../bus'

bus.on('command:hue:light:state', async (commandOpts) => {
  await setLightStateByName(commandOpts.name, commandOpts.state)
})

bus.on('command:hue:group:state', async (commandOpts) => {
  console.log('set group state', commandOpts)
  await setGroupStateByName(commandOpts.name, commandOpts.state)
})

const hue = new HueApi(config.get('hue.bridge'), config.get('hue.username'))
const state = lightState.create()
const sensorTypes = {
  'ZLLTemperature': 'temperature',
  'ZLLLightLevel': 'light',
  'ZLLPresence': 'motion'
}

function booleanState (b) {
  return b ? state.on() : state.off()
}

async function getBooleanLightStates () {
  const lights = await hue.lights()

  return lights.lights.map(l => {
    return {
      id: l.id,
      name: l.name,
      on: l.state.on,
      reachable: l.state.reachable
    }
  })
}

async function getSensorStates () {
  const sensors = await hue.sensors()

  return sensors.sensors.map(s => {
    return {
      id: s.id,
      name: s.name,
      type: sensorTypes[s.type] || s.type,
      state: s.state
    }
  })
}

async function getGroupByName (groupName) {
  const groups = await hue.groups()
  const group = groups.find(g => g.name === groupName )

  if (!group) {
    throw new Error(`could not find group by name: ${groupName}`)
  }

  return group
}

async function getLightByName (lightName) {
  const lights = await hue.lights()
  const light = lights.lights.find(l => l.name === lightName)

  if (!light) {
    throw new Error(`could not find light by name: ${lightName}`)
  }

  return light
}

export async function setGroupStateByName (groupName, stateBool) {
  const group = await getGroupByName(groupName)
  const newLightState = booleanState(stateBool).copy()

  return hue.setGroupLightState(group.id, newLightState).then(() => {
    bus.emit(`hue:lights:group:${stateBool ? 'on' : 'off'}`, groupName)
  })
}

export async function setLightStateByName (lightName, stateBool) {
  const light = await getLightByName(lightName)
  const newLightState = booleanState(stateBool).copy()

  return hue.setLightState(light.id, newLightState).then(() => {
    bus.emit(`hue:lights:light:${stateBool ? 'on' : 'off'}`, lightName)
  })
}

export default {
  name: 'hue',
  async collectState () {
    return {
      lights: await getBooleanLightStates(),
      sensors: await getSensorStates()
    }
  }
}
