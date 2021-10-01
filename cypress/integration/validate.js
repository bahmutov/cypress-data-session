// @ts-check
/// <reference path="../../src/index.d.ts" />

import '../../src'

describe('validate', () => {
  const name = 'validate-example'

  beforeEach(() => {
    // force starting fresh
    Cypress.clearDataSession(name)
  })

  it('without validate calls setup every time', () => {
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

  it('without validate calls setup every time (option)', () => {
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
})
