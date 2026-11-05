// @ts-check

import '../../../src'

describe('hash change', () => {
  const name = 'hash change example v1'

  beforeEach(() => {
    // force starting fresh
    Cypress.clearDataSession(name)
  })

  it('invalidates the session', () => {
    const stub1 = cy.stub().as('setup').returns(42)
    const setup = () => stub1()

    cy.dataSession({ name, setup, hash: 'foo' })
      .then(function (value) {
        expect(value, 'yielded').to.equal(42)
        expect(stub1).to.be.calledOnce
        stub1.resetHistory()
      })
      .then(() => {
        cy.log('**the same hash**')
        cy.dataSession({ name, setup, hash: 'foo' })
          .then(function (value) {
            expect(value, 'yielded').to.equal(42)
            expect(stub1).to.not.be.called
          })
          .then(() => {
            cy.log('**different hash**')
            cy.dataSession({ name, setup, hash: 'bar' }).then(function (value) {
              expect(value, 'yielded').to.equal(42)
              expect(stub1).to.be.calledOnce
            })
          })
      })
  })

  it('recomputes the user session on any object changes', () => {
    const user = { id: 1, name: 'Alice' }
    const stub1 = cy.stub().as('setup').returns(user)
    const setup = () => stub1()
    const hash = JSON.stringify(user) // or use any advanced hashing algorithm

    cy.dataSession({ name, setup, hash })
      .then(function () {
        expect(stub1).to.be.calledOnce
        stub1.resetHistory()
      })
      .then(() => {
        cy.dataSession({ name, setup, hash })
          .then(function () {
            expect(stub1).to.not.be.called
          })
          .then(() => {
            cy.log('**object changed**')
            user.name = 'Bob'
            const newHash = JSON.stringify(user)
            // note that the "standard" options all stay the same
            // like the name and setup function
            // so we need to pass the new hash to recompute the session
            cy.dataSession({ name, setup, hash: newHash }).then(
              function (value) {
                expect(value, 'yielded').to.equal(user)
                expect(stub1).to.be.calledOnce
              },
            )
          })
      })
  })
})
