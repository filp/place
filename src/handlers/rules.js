import config from 'config'
import moment from 'moment'
import bus from '../bus'
import logger from '../logger'

const rules = config.get('rules')
let flags = {}

const conditionHandlers = {
  time (rule, range) {
    const now = moment(new Date())
    const from = moment(range.from)
    let to = moment(range.to)

    if (to.isBefore(now)) {
      to = to.add(1, 'day')
    }

    return now.isBefore(to) && now.isAfter(from)
  },

  flag (rule, props) {
    if (props.present) {
      return flags[props.present]
    } else if (props.missing) {
      return typeof flags[props.missing] === 'undefined'
    }
  }
}

function checkConditions (rule) {
  if (!rule.conditions) return

  return Object.keys(rule.conditions).every(conditionType => {
    return conditionHandlers[conditionType](rule, rule.conditions[conditionType])
  })
}

function runRule (rule, triggerArgs) {
  const conditionsResult = checkConditions(rule)

  // If the rule does not meet the required conditions, do nothing:
  if (!conditionsResult) return

  rule.actions.forEach(a => {
    if (a.flag) {
      if (a.set) {
        flags[a.flag] = true
      } else if (flags[a.flag]) {
        delete flags[a.flag]
      }
    } else if (a.run) {
      bus.emit(a.run, a)
    }
  })

  bus.emit('rules:run', rule)
  bus.emit(`rules:${rule.name}:run`, rule)
}

// Enable rules on first run:
if (rules) {
  rules.forEach(rule => {
    bus.on(rule.trigger, (...triggerArgs) => runRule(rule, triggerArgs))
    logger.info({ name: rule.name, trigger: rule.trigger }, 'registered rule')
  })
}

export default {
  name: 'rules',
  async collectState () {
    return {
      rules
    }
  }
}

/*  
- description: Turn on bloom behind Gaming PC when it's active after 7PM
  trigger: network: device: gaming - pc: present
  conditions:
  time: "20:00-23:59"
  action:
  - flag: gaming - pc - bloom - toggle
  set: true
    - run: command: hue: lights: Bloom: state
      state: true
*/
