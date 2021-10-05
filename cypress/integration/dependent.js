// @ts-check
/// <reference path="../../src/index.d.ts" />

import '../../src'

describe('Dependent data session', () => {
  beforeEach(() => {
    Cypress.clearDataSession('parent')
    Cypress.clearDataSession('child')
  })

  it('depends on another session', function () {
    /** @type Cypress.DataSessionOptions */
    const parentOptions = {
      name: 'parent',
      setup: cy.stub().as('parentSetup').returns(1),
    }
    cy.dataSession(parentOptions)

    /** @type Cypress.DataSessionOptions */
    const childOptions = {
      name: 'child',
      setup: cy.stub().as('childSetup').returns(2),
      // because the validate prop is true,
      // the data is always valid
      // and does not need to be re-computed
      validate: true,
      // TODO: implement dependsOn
      // dependsOn: ['parent'],
    }
    cy.dataSession(childOptions)

    cy.get('@parentSetup').should('be.calledOnce').invoke('resetHistory')
    cy.get('@childSetup')
      .should('be.calledOnce')
      .invoke('resetHistory')
      .then(() => {
        cy.dataSession(parentOptions)
        // the parent data is re-computed because it does not have
        // the "validate" property
        cy.get('@parentSetup').should('be.calledOnce')
        // and the child data should be recomputed
        // since it depends on the parent, and the parent was recomputed
        cy.dataSession(childOptions)
        // TODO: implement dependsOn and invalidating data
        // cy.get('@childSetup').should('be.calledOnce')
      })
  })
})
