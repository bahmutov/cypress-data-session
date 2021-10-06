// @ts-check

import '../../src'

describe('validate', () => {
  const name = 'validate-example'

  beforeEach(() => {
    // force starting fresh
    Cypress.clearDataSession(name)
  })

  it('without validate calls the setup every time', () => {
    const setup = cy.stub().as('setup').returns(42)

    cy.dataSession(name, setup).then(function (value) {
      expect(value, 'yielded').to.equal(42)
      expect(this[name], 'aliased').to.equal(42)
      expect(this.setup).to.be.calledOnce
    })

    // on the next invocation, the setup is called again
    cy.dataSession(name, setup).then(function (value) {
      expect(value).to.equal(42)
      expect(this.setup).to.be.calledTwice
    })
  })

  it('without validate calls the setup every time (option)', () => {
    const setup = cy.stub().as('setup').returns(42)

    cy.dataSession({
      name,
      setup,
    }).then(function (value) {
      expect(value, 'yielded').to.equal(42)
      expect(this[name], 'aliased').to.equal(42)
      expect(this.setup).to.be.calledOnce
    })

    // on the next invocation, the setup is called again
    cy.dataSession({
      name,
      setup,
    }).then(function (value) {
      expect(value).to.equal(42)
      expect(this.setup).to.be.calledTwice
    })
  })

  context('boolean value', () => {
    it('if true no need to set the data again', () => {
      const setup = cy.stub().as('setup').returns(42)

      cy.dataSession(name, setup, true).then(function (value) {
        expect(value, 'yielded').to.equal(42)
        expect(this[name], 'aliased').to.equal(42)
        expect(this.setup).to.be.calledOnce
        this.setup.resetHistory()
      })

      // on the next invocation, the setup is NOT called
      cy.dataSession(name, setup, true).then(function (value) {
        expect(value).to.equal(42)
        expect(this.setup).to.not.be.called
      })
    })

    it('if false then setup runs again', () => {
      const setup = cy.stub().as('setup').returns(42)

      cy.dataSession(name, setup, false).then(function (value) {
        expect(value, 'yielded').to.equal(42)
        expect(this[name], 'aliased').to.equal(42)
        expect(this.setup).to.be.calledOnce
      })

      // on the next invocation, the setup is NOT called
      cy.dataSession(name, setup, false).then(function (value) {
        expect(value).to.equal(42)
        expect(this.setup).to.be.calledTwice
      })
    })

    it('if true no need to set the data again (option)', () => {
      const setup = cy.stub().as('setup').returns(42)

      cy.dataSession({
        name,
        setup,
        validate: true,
      }).then(function (value) {
        expect(value, 'yielded').to.equal(42)
        expect(this[name], 'aliased').to.equal(42)
        expect(this.setup).to.be.calledOnce
        this.setup.resetHistory()
      })

      // on the next invocation, the setup is NOT called
      cy.dataSession({
        name,
        setup,
        validate: true,
      }).then(function (value) {
        expect(value).to.equal(42)
        expect(this.setup).to.not.be.called
      })
    })
  })
})
