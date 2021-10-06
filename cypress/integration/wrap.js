// @ts-check

import '../..'

describe('Data B', () => {
  beforeEach(() => {
    cy.dataSession2(
      'B', // data name
      () => 'b', // data creation commands
      (x) => x === 'b', // data validation function
    )
  })

  it('has object B', () => {
    expect(Cypress.getDataSession('B')).to.equal('b')
  })

  it('has saved the value as an alias', function () {
    // the cy.dataSession automatically wraps the data yielded
    // by the setup function and saves it as an alias
    expect(this.B).to.equal('b')
  })
})
