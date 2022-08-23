// @ts-check

import '../../src'

// no matter how you reload this test
// (using the "Run all tests" button or via the browser reload)
// it preserves the data session
before(() => {
  const sessions = Cypress.dataSessions()
  if (sessions && sessions.length > 0) {
    Cypress.clearDataSessions()
  }
})

describe('Data session is preserved between the tests', () => {
  it('sets data session in the first test', function () {
    cy.dataSession({
      name: 'A',
      setup: () => {
        return 'a'
      },
    })
  })

  it('has the session', () => {
    expect(Cypress.dataSessions(), 'one data session').to.have.length(1)
  })
})
