// @ts-check
import '../../../src'

import { registerCacheAcrossSpecs } from './utils'

registerCacheAcrossSpecs()

describe('setting up shared cache', () => {
  it('sets up a shared cache A', () => {
    const setupSpy = cy.spy()
    // @ts-ignore
    cy.cacheAcrossSpecs(setupSpy).then(() => {
      expect(setupSpy).to.be.calledOnce
    })
  })
})
