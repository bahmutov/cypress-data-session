// @ts-check

import '../../src'

describe('Restores data session', () => {
  beforeEach(() => {
    Cypress.clearDataSession('parent')
  })

  // https://github.com/bahmutov/cypress-data-session/issues/42
  it('sets the session in Cypress.env', function () {
    /** @type Cypress.DataSessionOptions */
    const parentOptions = {
      name: 'parent',
      setup: cy.stub().as('parentSetup').returns(1),
      recreate: cy.stub().as('parentRecreate').returns(2),
      validate: true,
      shareAcrossSpecs: true,
    }
    const key = Cypress.formDataSessionKey('parent')
    cy.dataSession(parentOptions)
      .then(function () {
        expect(this.parent, 'has an alias').to.equal(1)
        cy.log('removing alias')
        delete this.parent
      })
      .then(() => {
        expect(Cypress.env()).to.have.property(key)

        cy.log('removing data session from env')
        delete Cypress.env()[key]
      })
      .then(() => {
        expect(Cypress.env()).to.not.have.property(key)

        cy.dataSession(parentOptions)
          .then(function () {
            expect(this.parent, 'has an alias').to.equal(1)
          })
          .then(() => {
            expect(Cypress.env()).to.have.property(key)
          })
      })
  })
})
