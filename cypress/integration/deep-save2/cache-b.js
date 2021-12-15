// @ts-check
import '../../../src'

import { SESSION_NAME, registerCacheAcrossSpecs } from './utils'

registerCacheAcrossSpecs()

describe('setting up shared cache', () => {
  it('sets up a shared cache B', () => {
    const setupSpy = cy.spy()

    const internalName = Cypress.formDataSessionKey(SESSION_NAME)
    cy.task('dataSession:load', internalName).then((data) => {
      // @ts-ignore
      cy.cacheAcrossSpecs(setupSpy).then(() => {
        if (data) {
          // we have previous data stored in the plugin process
          expect(setupSpy).to.not.be.called
        } else {
          expect(setupSpy).to.be.calledOnce
        }
      })
    })
  })
})
