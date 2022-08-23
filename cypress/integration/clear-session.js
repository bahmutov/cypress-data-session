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
    shareAcrossSpecs: true,
  })

  cy.dataSession({
    name: 'B',
    setup() {
      return 'b'
    },
    shareAcrossSpecs: true,
  })

  cy.dataSession({
    name: 'C',
    setup() {
      return 'c'
    },
    shareAcrossSpecs: true,
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
