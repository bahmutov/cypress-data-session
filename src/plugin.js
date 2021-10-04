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

  function deepClear(key) {
    debug('deepClear', key)
    debug('existing keys: %o', Object.keys(savedValues))

    if (!key in savedValues) {
      debug('could not find saved session "%s"', key)
      return false
    }
    delete savedValues[key]

    return true
  }

  on('task', {
    'dataSession:save': deepSave,
    'dataSession:load': deepLoad,
    'dataSession:clear': deepClear,
  })

  debug('registered plugin tasks')
}

module.exports = cypressDataSessionPlugin
