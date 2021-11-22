// @ts-check

import '../../src'

describe('Data C', () => {
  beforeEach(() => {
    Cypress.clearDataSession('C')
  })

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

  it('calls expected functions (valid)', function () {
    Cypress.setDataSession('C', 42)

    const setup = cy.stub().as('setup').returns('c')
    const validate = cy.stub().as('validate').returns(true)
    const invalidated = cy.stub().as('invalidated')

    cy.dataSession({
      name: 'C',
      setup,
      validate,
      onInvalidated: invalidated,
    })
      .should('equal', 42)
      .then(() => {
        expect(validate).to.be.calledOnceWithExactly(42)
        expect(setup).to.not.be.called
        expect(invalidated).to.not.be.called
      })
  })

  it('calls expected functions (invalidated)', function () {
    Cypress.setDataSession('C', 42)

    const setup = cy.stub().as('setup').returns('c')
    const validate = cy.stub().as('validate').returns(false)
    const invalidated = cy.stub().as('invalidated')

    cy.dataSession({
      name: 'C',
      setup,
      validate,
      onInvalidated: invalidated,
    })
      // changed the data to whatever "setup" yields
      .should('equal', 'c')
      .then(() => {
        expect(validate).to.be.calledOnceWithExactly(42)
        expect(setup).to.be.calledOnce
        expect(invalidated).to.be.calledOnceWithExactly(42)
        // check the order of calls
        expect(validate, 'validate -> invalidated').to.be.calledBefore(
          invalidated,
        )
        expect(invalidated, 'invalidated -> setup').to.be.calledBefore(setup)
      })
  })
})
