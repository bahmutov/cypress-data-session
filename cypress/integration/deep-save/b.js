/// <reference path="../../../src/index.d.ts" />

import '../../../src'

describe('deep save', () => {
  it('saves in spec b', () => {
    cy.dataSession(
      'A',
      () => 'a',
      (x) => x === 'a',
    )
  })
})
