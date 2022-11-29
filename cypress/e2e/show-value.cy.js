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

it('shows a small object', () => {
  cy.dataSession({
    name: 'object value',
    setup() {
      return { name: 'Joe', age: 20 }
    },
    showValue: true,
  })
})

it('shows a string object', () => {
  cy.dataSession({
    name: 'string value',
    setup() {
      return 'hello'
    },
    showValue: true,
  })
})
