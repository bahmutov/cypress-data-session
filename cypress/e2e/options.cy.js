// @ts-check

import '../../src'

describe('dataSession', () => {
  it('uses options object', () => {
    cy.dataSession({
      name: 'C',
      setup: () => 'c',
      validate: (x) => x === 'd',
    })
    // new value is computed and set
    cy.get('@C').should('equal', 'c')
  })
})
