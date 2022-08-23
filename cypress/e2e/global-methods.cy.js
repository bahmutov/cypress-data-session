// @ts-check

import '../../src'

describe('global session methods', () => {
  beforeEach(() => {
    // clear all data sessions
    Cypress.clearDataSessions()
  })

  beforeEach(() => {
    cy.dataSession({
      name: 'C',
      setup: () => 'c',
      validate: (x) => x === 'd',
    })

    cy.dataSession({
      name: 'D',
      setup: () => 'd',
    })

    cy.dataSession({
      name: 'X',
      setup: () => 'x',
    })

    cy.dataSession({
      name: 'Y',
      setup: () => 'y',
    })

    cy.dataSession({
      name: 'Z',
      setup: () => 'z',
    })
  })

  it('exist on Cypress object', () => {
    expect(Cypress).to.include.keys(
      'getDataSessionDetails',
      'getDataSession',
      'dataSessions',
      'setDataSession',
      'clearDataSession',
    )
  })

  it('has getDataSessionDetails', () => {
    const ds = Cypress.getDataSessionDetails('C')
    expect(ds).to.deep.include({
      data: 'c',
    })
  })

  it('has getDataSession', () => {
    const ds = Cypress.getDataSession('C')
    expect(ds).to.equal('c')
  })

  it('lists data sessions', () => {
    const sessions = Cypress.dataSessions()
    expect(sessions).to.deep.include({
      name: 'C',
      value: 'c',
    })
  })

  it('clears the data sessions', () => {
    const sessions = Cypress.dataSessions()
    expect(sessions).to.have.length.greaterThan(0)
    Cypress.clearDataSessions().then(() => {
      const currentSessions = Cypress.dataSessions()
      expect(currentSessions).to.deep.equal([])
    })
  })

  context('clearDataSession', () => {
    it('removes the alias', function () {
      expect(this.C, 'has an alias at the start').to.equal('c')
      Cypress.clearDataSession('C').then(function () {
        expect(this.C, 'has no alias after clear').to.be.undefined
      })
    })

    it('is part of the chain if called from a test', function () {
      expect(this.C, 'has an alias').to.equal('c')
      cy.wait(100).then(() => {
        // clearDataSession should not have cleared this alias yet!
        expect(this.C, 'has an alias after wait').to.equal('c')
      })
      Cypress.clearDataSession('C')
    })

    /**
     * A function that expects an array argument,
     * Useful to type-check the Cypress.dataSessions method
     * @param {void | unknown[]} x
     */
    function print(x) {
      console.log(x)
    }

    it('removes two sessions', () => {
      cy.wrap(null)
        .then(() => {
          Cypress.clearDataSession('X')
          Cypress.clearDataSession('Y')
        })
        .then(() => {
          print(Cypress.dataSessions())
          expect(Cypress.dataSessions(), '3 sessions remain').to.have.length(3)
        })
    })
  })
})
