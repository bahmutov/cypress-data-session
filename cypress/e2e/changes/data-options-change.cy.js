// @ts-check

import '../../../src'

describe('data options change', () => {
  const name = 'data-options-change-example'

  beforeEach(() => {
    // force starting fresh
    Cypress.clearDataSession(name)
  })

  it('invalidates the session', () => {
    const stub1 = cy.stub().as('setup').returns(42)
    const setup = () => stub1()

    cy.dataSession({ name, setup })
      .then(function (value) {
        expect(value, 'yielded').to.equal(42)
        expect(stub1).to.be.calledOnce
        stub1.resetHistory()
      })
      .then(() => {
        // using exactly same parameters does not recreate anything
        cy.log('**same data session options**')
        cy.dataSession({ name, setup })
          .then(function (value) {
            expect(value, 'yielded').to.equal(42)
            expect(stub1).to.not.be.called
          })
          .then(() => {
            // adding parameter "expires" invalidates the data session
            cy.log('**changed options**')
            cy.dataSession({ name, setup, expires: 10_000 }).then(function (
              value,
            ) {
              expect(value, 'yielded').to.equal(42)
              expect(stub1).to.be.calledOnce
            })
          })
      })
  })
})
