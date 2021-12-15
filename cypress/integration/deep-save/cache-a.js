// @ts-check
import '../../../src'

describe('setting up shared cache', () => {
  it('sets up a shared cache', () => {
    const setupSpy = cy.spy()
    cy.cacheAcrossSpecs(setupSpy).then(() => {
      expect(setupSpy).to.be.calledOnce
    })
  })
})
