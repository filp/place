import config from 'config'
import moment from 'moment'
import bus from '../bus'
import logger from '../logger'

const rules = config.get('rules')
let flags = {}
let lastRuleExecuted = null

bus.on('command:rules:run', opts => {
  const rule = rules.find(r => r.name === opts.rule)
  const withConditions = typeof opts.enforceConditions === 'undefined' ? true : opts.enforceConditions

  runRule(rule, opts, withConditions)
})

bus.on('rules:run', rule => {
  lastRuleExecuted = {
    name: rule.name,
    description: rule.description,
    triggers: rule.triggers
  }
})

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

function runRule (rule, triggerArgs, enforceConditions = true) {
  // If the rule does not meet the required conditions, do nothing:
  if (rule.conditions && enforceConditions && !checkConditions(rule)) return

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
    rule.triggers.forEach(t => bus.on(t, (...triggerArgs) => runRule(rule, triggerArgs)))
    logger.info({ name: rule.name, triggers: rule.triggers }, 'registered rule')
  })
}
export default {

  name: 'rules',
  async collectState () {
    return {
      lastRun: lastRuleExecuted
    }
  }
}
