/// <reference path="../../src/index.d.ts" />

import '../../src'

describe('Data C', () => {
  it('exists under an alias', function () {
    cy.dataSession(
      'C',
      () => 'c',
      // notice that the validate always fails
      (x) => x === 'd',
      // provide the third argument that is called
      // if the validation fails (in this case, it is always called)
      cy.stub().as('invalidated'),
    )
    cy.get('@C').should('equal', 'c')
    cy.get('@invalidated').should('be.calledOnceWith', 'c')
  })
})
