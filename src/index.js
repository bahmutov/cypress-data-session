/// <reference types="cypress" />

const debug = require('debug')('cypress-data-session')
const sha256 = require('./sha')
const { valueToString } = require('./utils')

const {
  getPluginConfigValue,
  setPluginConfigValue,
  getPluginConfigValues,
  removePluginConfigValue,
} = require('cypress-plugin-config')

/**
 * Name to use when logging our commands to Command Log
 */
const logName = 'data-session'

/**
 * Returns true if we are currently running a test
 */
function isTestRunning() {
  return !Boolean(Cypress.mocha.getRunner().stopped)
}

function formDataKey(name) {
  if (!name) {
    throw new Error('Missing name')
  }
  return 'dataSession:' + name
}

function isDataSessionKey(key) {
  return key.startsWith('dataSession:')
}

function extractKey(key) {
  return key.replace('dataSession:', '')
}

function getDataSession(name) {
  const dataKey = formDataKey(name)
  const entry = getPluginConfigValue(dataKey)
  if (entry) {
    return entry.data
  }
  return cy.task('dataSession:load', dataKey, { log: false }).then((loaded) => {
    if (loaded) {
      return loaded.data
    }

    throw new Error(`Could not find data session with name "${name}"`)
  })
}

// The predicate "validate" function checks the cached data
// against the current data to determine if we need to re-run
// the setup commands.
Cypress.Commands.add(
  'dataSession',
  function (name, setup, validate, onInvalidated) {
    if (arguments.length === 1 && Cypress._.isString(name)) {
      // the user simply wants to fetch the current data session by name
      return getDataSession(name)
    }

    let shareAcrossSpecs = false
    let init = Cypress._.noop
    let preSetup
    let recreate
    let dependsOn
    let showValue
    let expires
    let limit
    let recomputeOnRetry

    // check if we are using options / separate arguments
    if (typeof name === 'object') {
      const options = name
      name = options.name
      if ('init' in options) {
        init = options.init
      }
      setup = options.setup
      validate = options.validate
      onInvalidated = options.onInvalidated
      shareAcrossSpecs = options.shareAcrossSpecs
      recreate = options.recreate
      preSetup = options.preSetup
      dependsOn = options.dependsOn
      showValue = options.showValue
      expires = options.expires
      limit = options.limit
      recomputeOnRetry = options.recomputeOnRetry
    }

    if (typeof limit !== 'undefined') {
      if (typeof limit !== 'number') {
        throw new Error(
          `cypress-data-session: the limit for session ${name} is not a number`,
        )
      }
      if (limit < 1) {
        throw new Error(
          `cypress-data-session: the limit for session ${name} was ${limit}, should be positive`,
        )
      }
      if (shareAcrossSpecs) {
        throw new Error(
          [
            'cypress-data-session: limit and shareAcrossSpecs are not compatible yet',
            'https://github.com/bahmutov/cypress-data-session/issues/120',
          ].join('\n'),
        )
      }
    }

    if (typeof setup !== 'function') {
      throw new Error('setup must be a function')
    }

    // always have "dependsOn" as an array of strings
    if (typeof dependsOn === 'string') {
      dependsOn = [dependsOn]
    }
    if (typeof dependsOn === 'undefined' || dependsOn === null) {
      dependsOn = []
    }

    if (typeof validate === 'undefined') {
      // the user did not specify the validate function
      // thus we will use any non-nil value
      validate = () => true
    } else if (validate === false) {
      // if the user explicitly set the validate to false,
      // recompute the data every time
      validate = () => false
    } else if (validate === true) {
      // if the user explicitly set the validate to true,
      // any non-nil value is valid
      validate = () => true
    } else {
      // otherwise, we expect the user to pass in a function
      if (typeof validate !== 'function') {
        throw new Error('validate must be a function')
      }
    }

    const pluginDisabled = Cypress.env('dataSessions') === false

    const dataKey = formDataKey(name)

    function getDependsOnTimestamps() {
      return dependsOn.map((dep) => {
        const ds = Cypress.getDataSessionDetails(dep)
        if (!ds) {
          throw new Error(
            `Cannot find data session "${dep}" session "${name}" depends on`,
          )
        }
        return ds.timestamp
      })
    }

    // we want to recompute the data session if the user changes
    // any of its options or the code in the setup callback function
    const setupSource =
      JSON.stringify({
        expires,
        shareAcrossSpecs,
        dependsOn,
        showValue,
        limit,
      }) + setup.toString()

    const saveData = (data) => {
      if (data === undefined) {
        throw new Error('dataSession cannot yield undefined')
      }

      return sha256(setupSource).then((setupHash) => {
        if (!pluginDisabled) {
          // only save the data if the plugin is enabled
          // save the data for this session
          const timestamp = +new Date()
          const dependsOnTimestamps = getDependsOnTimestamps()

          const sessionData = {
            data,
            timestamp,
            dependsOnTimestamps,
            setupHash,
          }
          if (expires) {
            sessionData.expiresAt = timestamp + expires
          }
          if (typeof limit === 'number') {
            // count the current call towards the limit
            sessionData.limit = limit - 1
          }
          setPluginConfigValue(dataKey, sessionData)
          debug('set the data session %s to %o', dataKey, sessionData)

          if (shareAcrossSpecs) {
            debug('sharing the session %s across specs', dataKey)
            cy.task(
              'dataSession:save',
              { key: dataKey, value: sessionData },
              { log: false },
            )
          }
        }
        if (showValue) {
          const s = valueToString(data)
          Cypress.log({ log: logName, message: `**${name}** has data ${s}` })
        }
        // automatically create an alias
        cy.wrap(data, { log: false }).as(name)
      })
    }

    const setupAndSaveData = () => {
      if (preSetup) {
        cy.then(preSetup)
      }
      cy.then(setup).then(saveData)
    }

    if (pluginDisabled) {
      Cypress.log({ name: logName, message: 'plugin is disabled' })
      return setupAndSaveData()
    }

    Cypress.log({
      name: logName,
      message: `named **${name}**${shareAcrossSpecs ? ' (shared)' : ''}`,
    })

    let entry = getPluginConfigValue(dataKey)
    cy.wrap(entry ? entry.data : undefined, { log: false })
      .then((value) => {
        if (shareAcrossSpecs) {
          return cy
            .task('dataSession:load', dataKey, { log: false })
            .then((loaded) => {
              if (loaded) {
                entry = loaded
                return loaded.data
              }
              return undefined
            })
        }
      })
      .then((value) => {
        // if the value is undefined or null,
        // try generating it using the "init" callback
        if (Cypress._.isNil(value)) {
          if (!Cypress._.isFunction(init)) {
            throw new Error('dataSession: init must be a function')
          }
          return cy.then(init).then((initValue) => {
            if (Cypress._.isNil(initValue)) {
              // we need to re-run the setup commands
              Cypress.log({
                name: logName,
                type: 'parent',
                message: `first time for session **${name}**`,
              })
              return setupAndSaveData()
            } else {
              return cy
                .then(() => validate(initValue))
                .then((valid) => {
                  if (valid) {
                    Cypress.log({
                      name: logName,
                      type: 'parent',
                      message: `data **${name}** will use the init value`,
                    })

                    if (Cypress._.isFunction(recreate)) {
                      Cypress.log({
                        name: logName,
                        type: 'parent',
                        message: `recreating the **${name}**`,
                      })
                      return cy
                        .then(() => recreate(initValue))
                        .then(() => saveData(initValue, entry))
                    } else {
                      return saveData(initValue)
                    }
                  } else {
                    Cypress.log({
                      name: logName,
                      type: 'parent',
                      message: `data **${name}** init did not pass validation`,
                    })
                    return setupAndSaveData()
                  }
                })
            }
          })
        }

        return sha256(setupSource).then((setupHash) => {
          if (entry) {
            if (entry.setupHash && entry.setupHash !== setupHash) {
              // the setup function has changed,
              // we need to re-run the setup commands
              Cypress.log({
                name: logName,
                type: 'parent',
                message: `options changed for session **${name}**`,
              })
              return setupAndSaveData()
            }

            const now = +new Date()
            if (entry.expiresAt < now) {
              debug('session expired at %d now is %d', entry.expiresAt, now)
              Cypress.log({
                name: logName,
                type: 'parent',
                message: `data session **${name}** has expired`,
              })
              return setupAndSaveData()
            }
          }
          if ('limit' in entry) {
            if (entry.limit < 1) {
              debug('limit reached zero %o', entry)
              Cypress.log({
                name: logName,
                type: 'parent',
                message: `data session **${name}** has reached limit 0`,
              })
              return setupAndSaveData()
            } else {
              entry.limit -= 1
              debug('saving updated limit %o', entry)
              setPluginConfigValue(dataKey, entry)
            }
          }

          function returnValue() {
            // yield the wrapped value to the next command in the test
            return (
              cy
                .wrap(value, { log: false })
                // and set as an alias
                .as(name)
            )
          }

          /**
           * Looks up the timestamps from the data sessions
           * this session depends on. If any of the timestamps
           * are different, that means a "parent" data session
           * was recomputed and we must recompute our data.
           */
          function parentsRecomputed() {
            if (!entry) {
              debug('there is no entry for name "%s"', name)
              return false
            }
            if (!entry.dependsOnTimestamps) {
              throw new Error(
                `Missing depends on timestamps for data session "${name}"`,
              )
            }
            const currentTimestamps = getDependsOnTimestamps()
            const same = Cypress._.isEqual(
              entry.dependsOnTimestamps,
              currentTimestamps,
            )
            return same
          }

          cy.then(() => validate(value)).then((valid) => {
            if (valid) {
              const parentSessionsAreTheSame = parentsRecomputed()

              if (!parentSessionsAreTheSame) {
                debug('parentSessionsAreTheSame', parentSessionsAreTheSame)
                Cypress.log({
                  name: logName,
                  message: `recomputing **${name}** because a parent session has been recomputed`,
                })
              } else if (recomputeOnRetry && Cypress.currentRetry) {
                // we need to re-run the setup commands
                // because this test is retried and the user
                // wants to recreate the data session on retry
                Cypress.log({
                  name: logName,
                  type: 'parent',
                  message: `recreate on retry ${Cypress.currentRetry} session **${name}**`,
                })
              } else {
                if (showValue) {
                  const s = valueToString(value)
                  Cypress.log({
                    name: logName,
                    type: 'parent',
                    message: `data **${name}** ${s} is still valid`,
                  })
                } else {
                  Cypress.log({
                    name: logName,
                    type: 'parent',
                    message: `data **${name}** is still valid`,
                  })
                }
                if (Cypress._.isFunction(recreate)) {
                  Cypress.log({
                    name: logName,
                    message: `recreating **${name}**`,
                  })
                  return cy
                    .then(() => recreate(value))
                    .then(() => {
                      setPluginConfigValue(dataKey, entry)
                      debug(
                        'setting data session %s to %o and creating alias %s',
                        dataKey,
                        entry,
                        name,
                      )
                      // automatically create an alias
                      cy.wrap(value, { log: false }).as(name)
                    })
                    .then(returnValue)
                }

                if (!getPluginConfigValue(dataKey)) {
                  debug('Setting key %s to %o', dataKey, entry)
                  setPluginConfigValue(dataKey, entry)
                }
                return returnValue()
              }
            }

            cy.then(() => {
              if (onInvalidated) {
                return onInvalidated(value)
              }
            }).then(() => {
              Cypress.log({
                name: logName,
                type: 'parent',
                message: `recompute data for **${name}**`,
              })
              // TODO: validate the value yielded by the setup
              return setupAndSaveData()
            })
          })
        })
      })
  },
)

//
// Global methods
//

Cypress.clearDataSessions = () => {
  // clear any sessions stored in the plugin space
  function clearSharedSessions() {
    if (isTestRunning()) {
      return cy.task('dataSession:clearAll')
    } else {
      return cy.now('task', 'dataSession:clearAll')
    }
  }

  return clearSharedSessions().then(() => {
    const env = getPluginConfigValues()
    Cypress._.map(env, (value, key) => {
      if (isDataSessionKey(key)) {
        Cypress.clearDataSession(extractKey(key))
      }
    })
  })
}
// add a simple method to clear data for a specific session
Cypress.clearDataSession = (name) => {
  debug('clearing data session "%s"', name)
  if (!name) {
    throw new Error('Expected a data session name to clear')
  }

  const insideTest = isTestRunning()
  const dataKey = formDataKey(name)
  if (!(dataKey in getPluginConfigValues())) {
    console.warn('Could not find data session under name "%s"', name)
    const names = Object.keys(getPluginConfigValues())
      .filter(isDataSessionKey)
      .map(extractKey)
      .join(',')
    console.warn('Available data sessions: %s', names)
  } else {
    removePluginConfigValue(dataKey)
    debug('deleted data session key %s', dataKey)
  }
  // clears the data from the plugin side
  function clearSharedDataSession() {
    if (insideTest) {
      // delete the alias
      const context = Object.getPrototypeOf(cy.state('ctx'))
      delete context[name]
      return cy.task('dataSession:clear', dataKey, { log: false })
    } else {
      return cy.now('task', 'dataSession:clear', dataKey)
    }
  }

  function logCleared(cleared) {
    if (cleared) {
      console.log('cleared data session "%s"', name)
    } else {
      console.warn('could not find saved data session for name "%s"', name)
    }
  }

  if (insideTest) {
    Cypress.log({ name: logName, message: `clear data session **${name}**` })
    return cy
      .wrap(null, { log: false })
      .then(clearSharedDataSession)
      .then(logCleared)
  }

  return clearSharedDataSession().then(logCleared)
}

// enable or disable data sessions
Cypress.dataSessions = (enable) => {
  if (enable === undefined) {
    const env = getPluginConfigValues()
    const sessions = Cypress._.map(env, (value, key) => {
      if (isDataSessionKey(key) && value) {
        return {
          name: extractKey(key),
          value: value.data,
        }
      }
    }).filter(Boolean)

    console.table(sessions)
    return sessions
  }

  if (typeof enable !== 'boolean') {
    throw new Error('dataSessions argument must be a boolean or undefined')
  }
  Cypress.env('dataSessions', Boolean(enable))
  debug('set data sessions enabled? %o', Boolean(enable))
}

Cypress.getDataSession = (name) => {
  const entry = Cypress.getDataSessionDetails(name)
  if (!entry) {
    return undefined
  }

  return entry.data
}

Cypress.getDataSessionDetails = (name) => {
  const dataKey = formDataKey(name)
  return getPluginConfigValue(dataKey)
}

Cypress.getSharedDataSessionDetails = (name) => {
  // gets the value from the plugin side if any
  const dataKey = formDataKey(name)
  if (isTestRunning()) {
    return cy
      .task('dataSession:load', dataKey, { log: false })
      .then(console.log)
  } else {
    return cy
      .now('task', 'dataSession:load', dataKey, { log: false })
      .then(console.log)
  }
}

Cypress.setDataSession = (name, data, skipValueCheck) => {
  if (!skipValueCheck) {
    if (Cypress._.isNil(data)) {
      throw new Error(`Cannot set data session "${name}" to undefined or null`)
    }
  }

  const dataKey = formDataKey(name)
  const timestamp = +new Date()
  const dependsOnTimestamps = []

  const sessionData = { data, timestamp, dependsOnTimestamps }
  setPluginConfigValue(dataKey, sessionData)
  debug('set the data session %s to %o', name, sessionData)
}

/**
 * Prints data sessions stored in the plugin space
 */
Cypress.printSharedDataSessions = () => {
  if (isTestRunning()) {
    return cy.task('dataSession:print')
  }
  return cy.now('task', 'dataSession:print')
}

Cypress.formDataSessionKey = formDataKey
