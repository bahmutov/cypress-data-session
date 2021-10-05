/// <reference types="cypress" />

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

// The predicate "validate" function checks the cached data
// against the current data to determine if we need to re-run
// the setup commands.
Cypress.Commands.add('dataSession', (name, setup, validate, onInvalidated) => {
  let shareAcrossSpecs = false
  let preSetup
  let recreate
  let dependsOn

  // check if we are using options / separate arguments
  if (typeof name === 'object') {
    const options = name
    name = options.name
    setup = options.setup
    validate = options.validate
    onInvalidated = options.onInvalidated
    shareAcrossSpecs = options.shareAcrossSpecs
    recreate = options.recreate
    preSetup = options.preSetup
    dependsOn = options.dependsOn
  }

  // always have "dependsOn" as an array of strings
  if (typeof dependsOn === 'string') {
    dependsOn = [dependsOn]
  }
  if (typeof dependsOn === 'undefined') {
    dependsOn = []
  }

  if (!validate) {
    // if the user has not provided a validate function
    // or provided boolean value false,
    // then assume we need to recompute the data every time
    validate = () => false
  } else {
    if (validate === true) {
      // the user says the data is fine, no need to recompute
      validate = () => true
    }
  }

  const pluginDisabled = Cypress.env('dataSessions') === false

  const dataKey = formDataKey(name)

  const setupAndSaveData = () => {
    if (preSetup) {
      cy.then(preSetup)
    }
    cy.then(setup).then((data) => {
      if (data === undefined) {
        throw new Error('dataSession cannot yield undefined')
      }

      if (!pluginDisabled) {
        // only save the data if the plugin is enabled
        // save the data for this session
        Cypress.env(dataKey, data)

        // TODO: implement dependsOn

        if (shareAcrossSpecs) {
          cy.task('dataSession:save', { key: dataKey, value: data })
        }
      }
      // automatically create an alias
      cy.wrap(data, { log: false }).as(name)
    })
  }

  if (pluginDisabled) {
    cy.log('dataSessions disabled')
    return setupAndSaveData()
  }

  cy.log(`dataSession **${name}**`)

  cy.wrap(Cypress.env(dataKey), { log: false })
    .then((value) => {
      if (shareAcrossSpecs) {
        return cy.task('dataSession:load', dataKey)
      }
    })
    .then((value) => {
      // if the value is undefined or null,
      // we need to re-run the setup commands
      if (Cypress._.isNil(value)) {
        cy.log(`first time for session **${name}**`)
        return setupAndSaveData()
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

      cy.then(() => validate(value)).then((valid) => {
        if (valid) {
          cy.log(`data **${name}** is still valid`)
          if (Cypress._.isFunction(recreate)) {
            cy.log(`recreating **${name}**`)
            return cy.then(() => recreate(value)).then(returnValue)
          }

          return returnValue()
        }

        cy.then(() => {
          if (onInvalidated) {
            return onInvalidated(value)
          }
        }).then(() => {
          cy.log(`recompute data for **${name}**`)
          // TODO: validate the value yielded by the setup
          return setupAndSaveData()
        })
      })
    })
})

// add a simple method to clear data for a specific session
Cypress.clearDataSession = (name) => {
  const dataKey = formDataKey(name)
  if (!(dataKey in Cypress.env())) {
    console.warn('Could not find data session under name "%s"', name)
    const names = Object.keys(Cypress.env())
      .filter(isDataSessionKey)
      .map(extractKey)
      .join(',')
    console.warn('Available data sessions: %s', names)
  } else {
    Cypress.env(dataKey, undefined)
  }
  // clear the data from the plugin side
  cy.now('task', 'dataSession:clear', dataKey).then((cleared) => {
    if (cleared) {
      console.log('cleared data session "%s"', name)
    } else {
      console.warn('could not find saved data session for name "%s"', name)
    }
  })
}

// enable or disable data sessions
Cypress.dataSessions = (enable) => {
  Cypress.env('dataSessions', Boolean(enable))
}

Cypress.getDataSession = (name) => {
  const dataKey = formDataKey(name)
  return Cypress.env(dataKey)
}
