/// <reference types="cypress" />

import '../..'

describe('Data B', () => {
  beforeEach(() => {
    cy.dataSession(
      'B', // data name
      () => cy.wrap('b').as('B'), // data creation commands
      (x) => x === 'b', // data validation function
    )
  })

  it('has object B', () => {
    expect(Cypress.getDataSession('B')).to.equal('b')
  })

  it('has saved the value as an alias', function () {
    expect(this.B).to.equal('b')
  })
})
