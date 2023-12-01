// @ts-check
import '../../src'

describe('recomputeOnRetry: true', () => {
  let setupCounter

  beforeEach(() => {
    if (Cypress.currentRetry === 0) {
      setupCounter = 0
      Cypress.clearDataSession('example')
    }
  })

  it(
    'recomputes the data session when the test retries',
    { retries: 2 },
    () => {
      cy.dataSession({
        name: 'example',
        setup() {
          setupCounter += 1
          return 'data'
        },
        recomputeOnRetry: true,
      }).then(() => {
        if (Cypress.currentRetry < 2) {
          throw new Error(`Retry ${Cypress.currentRetry} error`)
        }

        // each retry should call the data setup
        expect(setupCounter, 'data session setup').to.equal(3)
      })
    },
  )
})

describe('recomputeOnRetry: false (default)', () => {
  let setupCounter

  beforeEach(() => {
    if (Cypress.currentRetry === 0) {
      setupCounter = 0
      Cypress.clearDataSession('example')
    }
  })

  it('reuses the data session when the test retries', { retries: 2 }, () => {
    cy.dataSession({
      name: 'example',
      setup() {
        setupCounter += 1
        return 'data'
      },
    }).then(() => {
      if (Cypress.currentRetry < 2) {
        throw new Error(`Retry ${Cypress.currentRetry} error`)
      }

      // does not recompute the setup
      // and simply uses the default data session
      expect(setupCounter, 'data session setup').to.equal(1)
    })
  })
})
