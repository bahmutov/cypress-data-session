// @ts-check

import '../../src'

describe('dataSession', () => {
  const name = 'recreate-me'

  beforeEach(() => {
    Cypress.clearDataSession(name)
  })

  it('calls recreate', () => {
    const setup = cy.stub().as('setup').returns(42)
    const validate = cy.stub().as('validate').returns(true)
    const recreate = cy.stub().as('recreate')

    cy.dataSession({
      name,
      setup,
      validate,
      recreate,
    }).then((value) => {
      expect(value).to.equal(42)
      cy.get('@setup').should('have.been.calledOnce').invoke('resetHistory')
      cy.get('@recreate').should('not.have.been.called')
    })

    // on next call, the setup should not be called, but validate should be
    // and then it calls recreate function
    cy.dataSession({
      name,
      setup,
      validate,
      recreate,
    }).then((value) => {
      expect(value).to.equal(42)
      cy.get('@setup').should('not.have.been.called')
      cy.get('@validate')
        .should('have.been.calledOnceWith', 42)
        .invoke('resetHistory')
      cy.get('@recreate').should('have.been.calledOnceWith', 42)
    })
  })
})
