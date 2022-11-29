// @ts-check

import '../../src'

it('shows the setup value', () => {
  cy.dataSession({
    name: 'my value',
    setup() {
      return 42
    },
    showValue: true,
  }).should('equal', 42)

  // recreate the data
  cy.dataSession({
    name: 'my value',
    setup() {
      return 42
    },
    showValue: true,
  }).should('equal', 42)
})
