// @ts-check

import '../../src'

describe('dataSession', () => {
  const name = 'presetup-example'

  beforeEach(() => {
    Cypress.clearDataSession(name)
  })

  it('calls presetup', () => {
    const preSetup = cy.stub().as('preSetup')
    const setup = cy.stub().as('setup').returns(42)
    const validate = cy.stub().as('validate').returns(true)

    cy.dataSession({
      name,
      preSetup,
      setup,
      validate,
    }).then(function (value) {
      expect(value, 'yielded').to.equal(42)
      expect(this[name], 'aliased').to.equal(42)
      expect(this.preSetup).to.be.calledOnce
      expect(this.setup).to.be.calledOnce
      expect(this.preSetup, 'pre before setup').to.be.calledBefore(this.setup)
      // reset stubs
      this.preSetup.resetHistory()
      this.setup.resetHistory()
    })

    // on the next invocation, the preSetup and setup are NOT called
    cy.dataSession({
      name,
      preSetup,
      setup,
      validate,
    }).then((value) => {
      expect(value).to.equal(42)
      cy.get('@preSetup').should('not.have.been.called')
      cy.get('@setup').should('not.have.been.called')
      cy.get('@validate')
        .should('have.been.calledOnceWith', 42)
        .invoke('resetHistory')
    })
  })
})
