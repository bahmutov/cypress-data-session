const debug = require('debug')('cypress-data-session')

function cypressDataSessionPlugin(on, config) {
  const savedValues = {}

  function deepSave({ key, value }) {
    debug('deepSave', key, value)

    if (typeof key !== 'string') {
      throw new Error(`key must be a string, was ${typeof key}`)
    }
    savedValues[key] = value

    // Cypress tasks should return something, at least null
    return null
  }

  function deepLoad(key) {
    debug('deepLoad', key)
    if (typeof key !== 'string') {
      throw new Error(`key must be a string, was ${typeof key}`)
    }
    const value = savedValues[key]
    debug('%s: %o', key, value)

    return value || null
  }

  on('task', {
    'dataSession:save': deepSave,
    'dataSession:load': deepLoad,
  })

  debug('registered plugin tasks')
}

module.exports = cypressDataSessionPlugin
