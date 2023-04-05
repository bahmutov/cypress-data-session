// @ts-check

import '../../src'

beforeEach(() => {
  Cypress.clearDataSession('with limit')
})

it('rebuilds the session after 2 uses', () => {
  const setup = cy.stub().returns(42)
  const session = () => {
    return cy.dataSession({
      name: 'with limit',
      setup,
      limit: 2,
    })
  }

  cy.log('**use 1**')
  session().then((value) => {
    expect(value, 'value').to.equal(42)
    expect(setup, 'initial').to.be.calledOnce
    setup.resetHistory()
  })
  cy.log('**use 2**')
  session().then((value) => {
    expect(value, 'value').to.equal(42)
    expect(setup).to.not.be.called
  })
  cy.log('**use 3, should recompute**')
  // now it will need to recompute the data
  session().then((value) => {
    expect(value, 'value').to.equal(42)
    expect(setup, 'over limit').to.be.calledOnce
    setup.resetHistory()
  })
  cy.log('**use 4, no recompute**')
  session().then((value) => {
    expect(value, 'value').to.equal(42)
    expect(setup).to.not.be.called
  })
})
