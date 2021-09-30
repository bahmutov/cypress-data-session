/// <reference types="cypress" />

function formDataKey(name) {
  if (!name) {
    throw new Error('Missing name')
  }
  return 'dataSession:' + name
}

// The predicate "validate" function checks the cached data
// against the current data to determine if we need to re-run
// the setup commands.
Cypress.Commands.add('dataSession', (name, setup, validate, onInvalidated) => {
  let shareAcrossSpecs = false

  // check if we are using options / separate arguments
  if (typeof name === 'object') {
    const options = name
    name = options.name
    setup = options.setup
    validate = options.validate
    onInvalidated = options.onInvalidated
    shareAcrossSpecs = options.shareAcrossSpecs
  }

  const pluginDisabled = Cypress.env('dataSessions') === false

  const dataKey = formDataKey(name)

  const setupAndSaveData = () => {
    cy.then(setup).then((data) => {
      if (data === undefined) {
        throw new Error('dataSession cannot yield undefined')
      }

      if (!pluginDisabled) {
        // only save the data if the plugin is enabled
        // save the data for this session
        Cypress.env(dataKey, data)

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

  cy.wrap(Cypress.env(dataKey))
    .then((value) => {
      if (shareAcrossSpecs) {
        return cy.task('dataSession:load', dataKey)
      }
    })
    .then((value) => {
      if (value === undefined) {
        cy.log(`first time for session **${name}**`)
        return setupAndSaveData()
      }

      cy.then(() => validate(value)).then((valid) => {
        if (valid) {
          cy.log(`data **${name}** is still valid`)
          // yield the wrapped value to the next command in the test
          cy.wrap(value, { log: false })
            // and set as an alias
            .as(name)
          return
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
  Cypress.env(dataKey, undefined)
  // clear the data from the plugin side
  cy.now('task', 'dataSession:save', {
    key: dataKey,
    value: undefined,
  }).then(() => {
    console.log('cleared data session "%s"', name)
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
