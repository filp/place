import getValue from 'get-value'

const outerDelimiterRe = /{{\s*[\w\.]+\s*}}/g
const innerPathRe = /[\w\.]+/

export function renderTemplate (tpl, ctx = {}) {
  return tpl.replace(outerDelimiterRe, function (interp) {
    const path = interp.match(innerPathRe)
    return getValue(ctx, path[0])
  })
}
