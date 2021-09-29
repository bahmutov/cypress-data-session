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
Cypress.Commands.add('dataSession', (name, setup, validate) => {
  const dataKey = formDataKey(name)

  const setupAndSaveData = () => {
    cy.then(setup).then((data) => {
      if (data === undefined) {
        throw new Error('dataSession cannot yield undefined')
      }
      // save the data for this session
      Cypress.env(dataKey, data)
    })
  }

  if (Cypress.env('dataSessions') === false) {
    cy.log('dataSessions disabled')
    return setupAndSaveData()
  }

  cy.log(`dataSession **${name}**`)
  const value = Cypress.env(dataKey)
  if (value === undefined) {
    cy.log(`first time for session **${name}**`)
    return setupAndSaveData()
  }

  cy.then(() => validate(value)).then((valid) => {
    if (valid) {
      cy.log(`data **${name}** is still valid`)
      cy.wrap(value, { log: false })
      return
    }

    cy.log(`recompute data for **${name}**`)
    // TODO: validate the value yielded by the setup
    return setupAndSaveData()
  })
})

// add a simple method to clear data for a specific session
Cypress.clearDataSession = (name) => {
  const dataKey = formDataKey(name)
  Cypress.env(dataKey, undefined)
  console.log('cleared data session "%s"', name)
}

// enable or disable data sessions
Cypress.dataSessions = (enable) => {
  Cypress.env('dataSessions', Boolean(enable))
}

Cypress.getDataSession = (name) => {
  const dataKey = formDataKey(name)
  return Cypress.env(dataKey)
}
