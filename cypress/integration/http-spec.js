// @ts-check

import '../../src'

describe('HTTP site', { baseUrl: 'http://neverssl.com' }, () => {
  const name = 'http-site'

  beforeEach(() => {
    cy.visit('/')
  })

  beforeEach(() => {
    // force starting fresh
    Cypress.clearDataSession(name)
  })

  it('set change invalidates the session', () => {
    const stub1 = cy.stub().as('setup').returns(42)
    const setup = () => stub1()

    const stub2 = cy.stub().as('setup2').returns(101)
    const setup2 = () => stub2()

    cy.dataSession(name, setup, true)
      .then(function (value) {
        expect(value, 'yielded').to.equal(42)
        expect(this[name], 'aliased').to.equal(42)
        expect(this.setup).to.be.calledOnce
        expect(this.setup2).to.not.be.called
        this.setup.resetHistory()
      })
      .then(() => {
        // if we use the same setup function, then the session is not invalidated
        cy.log('**same setup function**')
        cy.dataSession(name, setup, true)
          .then(function (value) {
            expect(value, 'yielded').to.equal(42)
            expect(this[name], 'aliased').to.equal(42)
            expect(this.setup).to.not.be.called
            expect(this.setup2).to.not.be.called
          })
          .then(() => {
            // if we changing the spec function
            cy.log('**changed setup function**')
            cy.dataSession(name, setup2, true).then(function (value) {
              expect(value, 'yielded').to.equal(101)
              expect(this[name], 'aliased').to.equal(101)
              expect(this.setup).to.not.be.called
              expect(this.setup2).to.be.calledOnce
            })
          })
      })
  })
})
