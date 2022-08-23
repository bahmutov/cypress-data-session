// @ts-check
import '../../../src'

describe('deep save', () => {
  it('saves in spec b', () => {
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
