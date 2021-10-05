// @ts-check
/// <reference path="../../src/index.d.ts" />

import '../../src'

describe('Data C', () => {
  it('exists under an alias', function () {
    // force invalidation by putting some random data
    Cypress.setDataSession('C', 42)

    cy.dataSession(
      'C',
      () => 'c',
      // notice that the validate always fails
      (x) => x === 'd',
      // provide the third argument that is called
      // if the validation fails (in this case, it is always called)
      cy.stub().as('invalidated'),
    )
    // new value is computed and set
    cy.get('@C').should('equal', 'c')
    // our initial wrong value was passed to onInvalidate argument
    cy.get('@invalidated').should('be.calledOnceWith', 42)
  })
})
