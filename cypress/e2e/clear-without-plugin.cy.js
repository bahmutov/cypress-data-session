// @ts-check

import '../../src'

beforeEach(() => {
  Cypress.env('cypressDataSessionPluginRegistered', true)
})

it('calls task to clear the data session', () => {
  cy.dataSession({
    name: 'Aa',
    setup() {
      return 'a'
    },
    shareAcrossSpecs: true,
  })
  cy.spy(cy, 'task').as('task')
  cy.then(() => {
    Cypress.clearDataSession('Aa')
  })
  cy.get('@task').should(
    'have.been.calledWith',
    'dataSession:clear',
    'dataSession:Aa',
  )
  cy.log('**memory session was cleared**').then(() => {
    expect(Cypress.getDataSessionDetails('Aa'), 'Aa session').to.be.undefined
  })
})

it('does not call the task to clear the data session', () => {
  Cypress.env('cypressDataSessionPluginRegistered', false)
  cy.dataSession({
    name: 'Aa',
    setup() {
      return 'a'
    },
    shareAcrossSpecs: true,
  })
  cy.log('**memory session**').then(() => {
    expect(Cypress.getDataSessionDetails('Aa'), 'Aa session').to.be.an('object')
  })

  cy.spy(cy, 'task').as('task')
  cy.then(() => {
    Cypress.clearDataSession('Aa')
  })
  cy.get('@task').should(
    'not.have.been.calledWith',
    'dataSession:clear',
    'dataSession:Aa',
  )
  cy.log('**memory session was cleared**').then(() => {
    expect(Cypress.getDataSessionDetails('Aa'), 'Aa session').to.be.undefined
  })
})
