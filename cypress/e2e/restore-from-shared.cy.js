// @ts-check
import '../../src'
import { getPluginConfigValues } from 'cypress-plugin-config'

describe('restores session from stored', () => {
  const name = 'test-data'
  const key = Cypress.formDataSessionKey(name)
  let setup

  beforeEach(() => {
    setup = cy.stub().returns('test value')
  })

  function verifyDataSession(value) {
    expect(value)

    cy.then(() => {
      // the cached data was put into Cypress.env
      expect(getPluginConfigValues())
        .to.have.property(key)
        .and.to.be.an('object')
        .and.to.have.property('data', 'test value')
    })
      .then(() => {
        // the data session was stored in the plugin
        Cypress.printSharedDataSessions()
          .should('not.be.empty')
          .and('have.property', key)
          .should('be.an', 'object')
          .should('have.property', 'data', 'test value')
      })
      .then(() => {
        // has created an alias
        cy.get('@test-data').should('equal', 'test value')
      })
  }

  // run the tests in order to verify
  // 1. the data session was stored from the plugin space and saved in Cypress.env
  // 2. the alias was recreated correctly
  // https://github.com/bahmutov/cypress-data-session/issues/39
  it('1. puts restored value into Cypress.env', () => {
    Cypress.clearDataSessions()

    cy.dataSession({
      name,
      setup,
      validate: true,
      shareAcrossSpecs: true,
    })
      .then(verifyDataSession)
      .then(() => {
        expect(setup).to.have.been.calledOnce
        setup.resetHistory()
      })
      .then(() => {
        cy.log('**removing from memory**')
        delete Cypress.env()[key]
      })
      .then(() => {
        cy.log('**data session again**')
        // should fully restore the data from the plugin space
        cy.dataSession({
          name,
          setup,
          validate: true,
          shareAcrossSpecs: true,
        })
          .then(verifyDataSession)
          .then(() => {
            // because the session was fully restored
            // the setup should not have been called
            expect(setup).to.not.be.called
          })
      })
  })

  // enable to see that the alias does not exist
  // because all aliases are reset by Cypress before each test
  it.skip('2. resets the data session alias', () => {
    cy.get('@test-data')
  })

  it('3. puts restored value into an alias', () => {
    cy.dataSession({
      name,
      setup,
      validate: true,
      shareAcrossSpecs: true,
    })
      .then(verifyDataSession)
      .then(() => {
        // because the session was fully restored
        // the setup should not have been called
        expect(setup).to.not.be.called
      })
  })
})
