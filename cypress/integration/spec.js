/// <reference types="cypress" />

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
})
