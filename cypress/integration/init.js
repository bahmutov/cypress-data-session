// @ts-check

import '../../src'

describe('init', () => {
  const name = 'init-example'

  beforeEach(() => {
    Cypress.clearDataSession(name)
  })

  it('inits the cached value manually', () => {
    // puts the value into the data session
    Cypress.setDataSession(name, 'foo')

    const setup = cy.stub().as('setup').returns(42)
    const validate = cy.stub().as('validate').returns(true)

    // we have already put our value into the data session
    cy.dataSession({
      name,
      setup,
      validate,
    }).then((value) => {
      // the value is whatever we put into the data session
      expect(value, 'data value').to.equal('foo')
      expect(validate).to.be.calledOnce
      expect(setup).to.not.to.be.called
    })
  })

  it('does not call init if the value is present', () => {
    // puts the value into the data session
    Cypress.setDataSession(name, 'bar')

    const init = cy.stub().as('init')
    const setup = cy.stub().as('setup').returns(42)
    const validate = cy.stub().as('validate').returns(true)

    // we have already put our value into the data session
    cy.dataSession({
      name,
      setup,
      validate,
      init,
    }).then((value) => {
      // the value is whatever we put into the data session
      expect(value, 'data value').to.equal('bar')
      expect(validate).to.be.calledOnce
      expect(init).to.not.to.be.called
      expect(setup).to.not.to.be.called
    })
  })

  it('calls init', () => {
    const init = cy.stub().as('init').returns('foo')
    const setup = cy.stub().as('setup').returns(42)
    const validate = cy.stub().as('validate').returns(true)

    cy.dataSession({
      name,
      init,
      setup,
      validate,
    }).then((value) => {
      expect(value, 'data value').to.equal('foo')
      // calls "init" because there is not value in the data session yet
      expect(init).to.be.calledOnce
      // we are not calling "validate" for init result
      expect(validate).not.to.be.called
      expect(setup).not.to.be.called

      init.resetHistory()
      validate.resetHistory()
    })

    // call the data session method again, this time
    // the value should be present, and the "init" callback
    // should not be needed, value is validated and used
    cy.dataSession({
      name,
      init,
      setup,
      validate,
    }).then((value) => {
      expect(value, 'data value').to.equal('foo')
      expect(init).to.not.to.be.called
      expect(validate).to.have.been.calledOnceWithExactly('foo')
      expect(setup).to.not.to.be.called

      init.resetHistory()
      validate.resetHistory()
    })
  })
})
