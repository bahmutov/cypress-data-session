// @ts-check
/// <reference path="../../src/index.d.ts" />

import '../..'

describe('Data A', () => {
  beforeEach(() => {
    cy.dataSession(
      'A', // data name
      () => 'a', // data creation commands
      (x) => x === 'a', // data validation function
    )
  })

  it('has object A', () => {
    expect(Cypress.getDataSession('A')).to.equal('a')
  })

  it('exists under an alias', function () {
    expect(this.A).to.equal('a')
  })

  it('can be fetched from the alias', () => {
    cy.get('@A').should('equal', 'a')
  })
})
