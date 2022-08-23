// @ts-check

import '../../src'

beforeEach(() => {
  const keys = Cypress._.keys(Cypress.env())
  console.log(keys)
  expect(keys).to.not.include(Cypress.formDataSessionKey('A'))
})

beforeEach(() => {
  Cypress.dataSessions()
})

beforeEach(() => {
  cy.dataSession({
    name: 'A',
    setup() {
      return 'a'
    },
  })

  cy.dataSession({
    name: 'B',
    setup() {
      return 'b'
    },
  })
})

it('removes the session A', function () {
  expect(this.A, 'session A').to.equal('a')
  Cypress.clearDataSession('A')
})

it('recreates A', function () {
  expect(this.A, 'session A').to.equal('a')
  Cypress.clearDataSession('A')
})
