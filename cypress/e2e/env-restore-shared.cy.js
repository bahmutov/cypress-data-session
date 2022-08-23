// @ts-check

import '../../src'

describe('Restores data session', () => {
  beforeEach(() => {
    Cypress.clearDataSession('parent')
    Cypress.clearDataSession('child')
  })

  it('sets the session in Cypress.env', function () {
    /** @type Cypress.DataSessionOptions */
    const parentOptions = {
      name: 'parent',
      setup: cy.stub().as('parentSetup').returns(1),
      recreate: cy.stub().as('parentRecreate').returns(2),
      validate: true,
      shareAcrossSpecs: true,
    }

    /** @type Cypress.DataSessionOptions */
    const childOptions = {
      name: 'child',
      setup: cy.stub().as('childSetup').returns(1),
      validate: true,
      dependsOn: 'parent',
    }

    const key = Cypress.formDataSessionKey('parent')

    let parentComputedAt
    cy.dataSession(parentOptions).then(() => {
      const parentDataSession = Cypress.getDataSessionDetails('parent')
      expect(parentDataSession, 'parent has timestamp').to.have.property(
        'timestamp',
      )
      parentComputedAt = parentDataSession.timestamp
      expect(parentComputedAt, 'parent timestamp').to.be.greaterThan(1)
    })
    cy.dataSession(childOptions)
      .then(() => {
        const childDataSession = Cypress.getDataSessionDetails('child')
        expect(childDataSession, 'child has parent timestamp').to.have.property(
          'dependsOnTimestamps',
        )
        const childParentComputedAt = childDataSession.dependsOnTimestamps[0]
        expect(childParentComputedAt, 'timestamps match').to.equal(
          parentComputedAt,
        )
      })
      .then(() => {
        delete Cypress.env()[key]
      })
      .then(() => {
        cy.dataSession(parentOptions)
        cy.dataSession(childOptions)
      })

    // both the parent and the child setup should be called just once
    cy.get('@parentSetup').should('be.calledOnce')
    cy.get('@parentRecreate').should('be.calledOnce')

    // the parent session should be restored in memory
    // with the original timestamps, thus the child session
    // should not be recomputed
    // https://github.com/bahmutov/cypress-data-session/issues/43

    cy.then(() => {
      const childDataSession = Cypress.getDataSessionDetails('child')
      expect(childDataSession, 'child has parent timestamp').to.have.property(
        'dependsOnTimestamps',
      )
      const childParentComputedAt = childDataSession.dependsOnTimestamps[0]
      expect(childParentComputedAt, 'timestamps match').to.equal(
        parentComputedAt,
      )
    })
    // and the child session should not be recomputed
    cy.get('@childSetup').should('be.calledOnce')
  })
})
