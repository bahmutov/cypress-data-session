// @ts-check
/// <reference path="../../src/index.d.ts" />

import '../../src'

describe('Data A', () => {
  beforeEach(() => {
    function setup() {
      cy.log('creating A')
      cy.wait(1000, { log: false }).then(() => {
        return 'a'
      })
    }

    function validate(x) {
      return cy.log('validating', x).then(() => {
        return x === 'a'
      })
    }

    cy.dataSession(
      'A', // data name
      setup, // data creation commands
      validate, // data validation function
    )
  })

  it('has object A', () => {
    expect(Cypress.getDataSession('A')).to.equal('a')
  })
})
