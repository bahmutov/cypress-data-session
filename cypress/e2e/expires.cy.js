// @ts-check

import '../../src'

beforeEach(() => {
  Cypress.clearDataSession('expires')
})

it('expires data session after 500ms', () => {
  const setup = cy.stub().returns(42)
  const session = () => {
    return cy.dataSession({
      name: 'expires',
      setup,
      expires: 500,
    })
  }

  session().then((value) => {
    expect(value, 'value').to.equal(42)
    expect(setup, 'initial').to.be.calledOnce
    setup.resetHistory()
  })
  cy.wait(100)
  cy.log('**session is still valid**')
  session().then((value) => {
    expect(value, 'value').to.equal(42)
    expect(setup).to.not.be.called
  })
  cy.wait(500)
  session().then((value) => {
    expect(value, 'value').to.equal(42)
    expect(setup, 'recreated expired').to.be.calledOnce
  })
})
