// @ts-check
import '../../src'

describe('restores session from stored', () => {
  beforeEach(() => {
    Cypress.clearDataSessions()
  })

  // https://github.com/bahmutov/cypress-data-session/issues/39
  it('puts restored value into Cypress.env', () => {
    const name = 'test-data'
    const key = Cypress.formDataSessionKey(name)
    const setup = cy.stub().returns('test value')

    function verifyDataSession(value) {
      expect(value)

      cy.then(() => {
        // the cached data was put into Cypress.env
        expect(Cypress.env())
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
})
