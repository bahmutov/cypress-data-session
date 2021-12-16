// @ts-check
import '../../src'

describe('restores session from stored', () => {
  beforeEach(() => {
    Cypress.clearDataSessions()
  })

  // https://github.com/bahmutov/cypress-data-session/issues/39
  it('puts restored value into Cypress.env', () => {
    const setup = cy.stub().returns('test value')

    cy.dataSession({
      name: 'test-data',
      setup,
      validate: true,
      shareAcrossSpecs: true,
    })
      .should('equal', 'test value')
      .then(() => {
        expect(setup).to.have.been.calledOnce
        setup.resetHistory()
        Cypress.printSharedDataSessions().should('not.be.empty')
      })
  })
})
