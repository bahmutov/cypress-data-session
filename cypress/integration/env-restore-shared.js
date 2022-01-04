// @ts-check

import '../../src'

describe('Restores data session', () => {
  beforeEach(() => {
    Cypress.clearDataSession('parent')
    Cypress.clearDataSession('child')
  })

  it('sets the session in Cypress.env', function () {
    /** @type Cypress.DataSessionOptions */
    const parentOptions = {
      name: 'parent',
      setup: cy.stub().as('parentSetup').returns(1),
      recreate: cy.stub().as('parentRecreate').returns(2),
      validate: true,
      shareAcrossSpecs: true,
    }

    /** @type Cypress.DataSessionOptions */
    const childOptions = {
      name: 'child',
      setup: cy.stub().as('childSetup').returns(1),
      validate: true,
      dependsOn: 'parent',
    }

    const key = Cypress.formDataSessionKey('parent')

    cy.dataSession(parentOptions)
    cy.dataSession(childOptions)
      .then(() => {
        delete Cypress.env()[key]
      })
      .then(() => {
        cy.dataSession(parentOptions)
        cy.dataSession(childOptions)
      })

    // both the parent and the child setup should be called just once
    cy.get('@parentSetup').should('be.calledOnce')
    // the parent session should be restored in memory
    // with the original timestamps, thus the child session
    // should not be recomputed
    // https://github.com/bahmutov/cypress-data-session/issues/43
    // cy.get('@childSetup').should('be.calledOnce')
  })
})
