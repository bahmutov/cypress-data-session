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

  context('valid vs invalid with cached data', () => {
    beforeEach(() => {
      // put a valid into the cache
      Cypress.setDataSession(name, 42)
    })

    it('is valid (blue)', () => {
      const setup = cy.stub().as('setup').throws('Nope')
      const validate = cy.stub().as('validate').returns(true)
      const recreate = cy.stub().as('recreate')
      cy.dataSession({
        name,
        setup,
        validate,
        recreate,
      })
        // yields the cached value
        .should('equal', 42)
        .then(() => {
          expect(validate, 'validate').to.be.calledOnceWith(42)
          expect(recreate, 'recreate').to.be.calledOnce
          expect(validate, 'validate -> recreate').to.be.calledBefore(recreate)
        })
    })

    it('is invalid (green)', () => {
      const preSetup = cy.stub().as('preSetup')
      const setup = cy.stub().as('setup').returns('changed')
      const validate = cy.stub().as('validate').returns(false)
      const onInvalidated = cy.stub().as('onInvalidated')
      const recreate = cy.stub().as('recreate').throws('Nope')
      cy.dataSession({
        name,
        preSetup,
        setup,
        validate,
        onInvalidated,
        recreate,
      })
        // yields the value from "setup"
        .should('equal', 'changed')
        .then(() => {
          expect(validate, 'validate').to.be.calledOnceWith(42)
          expect(onInvalidated, 'onInvalidated').to.be.calledOnceWith(42)
          expect(recreate, 'recreate').to.not.be.called
          expect(preSetup, 'preSetup').to.be.calledOnce
          expect(setup, 'setup').to.be.calledOnce
        })

      cy.log('**order of calls**').then(() => {
        expect(validate, 'validate -> onInvalidated').to.be.calledBefore(
          onInvalidated,
        )
        expect(onInvalidated, 'onInvalidated -> preSetup').to.be.calledBefore(
          preSetup,
        )
        expect(preSetup, 'preSetup -> setup').to.be.calledBefore(setup)
      })
    })
  })
})
