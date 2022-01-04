// @ts-check

import '../../src'

describe('Restores data session', () => {
  beforeEach(() => {
    Cypress.clearDataSession('parent')
  })

  it('sets the session in Cypress.env', function () {
    /** @type Cypress.DataSessionOptions */
    const parentOptions = {
      name: 'parent',
      setup: cy.stub().as('parentSetup').returns(1),
      validate: true,
      shareAcrossSpecs: true,
    }
    const key = Cypress.formDataSessionKey('parent')
    cy.dataSession(parentOptions)
      .then(() => {
        expect(Cypress.env()).to.have.property(key)

        cy.log('removing data session from env')
        delete Cypress.env()[key]
      })
      .then(() => {
        expect(Cypress.env()).to.not.have.property(key)

        cy.dataSession(parentOptions).then(() => {
          expect(Cypress.env()).to.have.property(key)
        })
      })
  })
})
