const debug = require('debug')('cypress-data-session')

function cypressDataSessionPlugin(on, config) {
  function deepSave({ key, value }) {
    debug('deepSave', key, value)

    // Cypress tasks should return something, at least null
    return null
  }

  on('task', {
    deepSave,
  })
}

module.exports = cypressDataSessionPlugin
