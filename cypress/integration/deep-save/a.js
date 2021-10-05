// @ts-check
/// <reference path="../../../src/index.d.ts" />

import '../../../src'

describe('deep save', () => {
  it('saves in spec a', () => {
    cy.dataSession({
      name: 'deep-saved',
      setup: () => 'a',
      validate: (x) => x === 'a',
      shareAcrossSpecs: true,
    })
    // new value is computed and set
    cy.get('@deep-saved').should('equal', 'a')
    // check the value in the plugins
    const dataKey = Cypress.formDataSessionKey('deep-saved')
    cy.task('dataSession:load', dataKey)
      .should('deep.include', {
        data: 'a',
        dependsOnTimestamps: [],
      })
      .and('have.property', 'timestamp')
      .and('to.be.a', 'number')
  })
})
