// @ts-check

import '../../src'
import {
  getPluginConfigValues,
  removePluginConfigValue,
} from 'cypress-plugin-config'

describe('Restores data session', () => {
  beforeEach(() => {
    Cypress.clearDataSession('parent')
  })

  it('sets the session in its own data storage', function () {
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
        expect(getPluginConfigValues()).to.have.property(key)

        cy.log('removing data session from env')
        removePluginConfigValue(key)
      })
      .then(() => {
        expect(getPluginConfigValues()).to.not.have.property(key)

        cy.dataSession(parentOptions).then(() => {
          expect(getPluginConfigValues()).to.have.property(key)
        })
      })
  })
})
