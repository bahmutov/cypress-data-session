const debug = require('debug')('cypress-data-session')

function cypressDataSessionPlugin(on, config) {
  const savedValues = {}

  function printDataSessions() {
    const n = Object.keys(savedValues).length
    console.log('%d data session(s)', n)
    Object.keys(savedValues).forEach((key) => {
      console.log('  %s: %o', key, savedValues[key])
    })

    return savedValues
  }

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
    debug('%s: value is %o', key, value)

    return value || null
  }

  function deepClear(key) {
    if (typeof key !== 'string') {
      throw new Error('Expected a string key')
    }
    debug('deepClear', key)
    debug('existing keys: %o', Object.keys(savedValues))

    if (!key in savedValues) {
      debug('could not find saved session "%s"', key)
      return false
    }
    delete savedValues[key]
    debug('removed key "%s", remaining keys: %o', key, Object.keys(savedValues))

    return true
  }

  function clearAll() {
    const n = Object.keys(savedValues).length
    debug('clearing all %d data sessions', n)
    Object.keys(savedValues).forEach((key) => {
      delete savedValues[key]
    })

    return null
  }

  on('task', {
    'dataSession:save': deepSave,
    'dataSession:load': deepLoad,
    'dataSession:clear': deepClear,
    'dataSession:clearAll': clearAll,
    'dataSession:print': printDataSessions,
  })

  debug('registered plugin tasks')
}

module.exports = cypressDataSessionPlugin
