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
  })
})
