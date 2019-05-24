import { promisify } from 'util'
import Push from 'pushover-notifications'
import config from 'config'
import bus from '../bus'
import { renderTemplate } from '../templating'
import handlers from '.'

bus.on('command:pushover:send', async (commandOpts) => {
  await sendToPushover(commandOpts)
})

const messageDefaults = config.get('pushover').defaults || {}
const push = new Push({
  user: config.get('pushover.user'),
  token: config.get('pushover.token')
})

const sendAsync = promisify(push.send).bind(push)

function applyInterpolation (msg, fields, ctx) {
  let msgWithInterpolation = {}

  Object.keys(msg).forEach(k => {
    if (fields.indexOf(k) !== -1) {
      msgWithInterpolation[k] = renderTemplate(msg[k], ctx)
    } else {
      msgWithInterpolation[k] = msg[k]
    }
  })

  return msgWithInterpolation
}

export async function sendToPushover (msg) {
  const tplContext = {
    state: await handlers.collectState(),
    self: {
      executedAt: new Date().toISOString(),
      message: msg
    }
  }

  const messageBody = applyInterpolation(
    { ...messageDefaults, ...msg },
    ['message', 'title', 'device', 'url', 'url_title', 'file'],
    tplContext
  )

  const mess = sendAsync(messageBody)
  bus.emit('pushover:sent', messageBody)
  return mess
}

export default {
  name: 'pushover',
  async collectState () {
    return {}
  }
}
