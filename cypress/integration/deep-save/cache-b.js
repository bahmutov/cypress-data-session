// @ts-check
import '../../../src'

describe('using pre-saved cache', () => {
  it('uses a shared cache', () => {
    const setupSpy = cy.spy()
    cy.cacheAcrossSpecs(setupSpy).then(() => {
      expect(setupSpy).not.to.be.called
    })
  })
})
