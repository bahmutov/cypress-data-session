// @ts-check
import '../../src'

describe('Dependent data session across specs', () => {
  beforeEach(() => {
    Cypress.clearDataSession('parent')
    Cypress.clearDataSession('child')
  })

  it('depends on another session', function () {
    /** @type Cypress.DataSessionOptions */
    const parentOptions = {
      name: 'parent',
      setup: cy.stub().as('parentSetup').returns(1),
      shareAcrossSpecs: true,
      // recompute the parent session every time
      validate: false,
    }
    cy.dataSession(parentOptions)

    /** @type Cypress.DataSessionOptions */
    const childOptions = {
      name: 'child',
      setup: cy.stub().as('childSetup').returns(2),
      // because the validate prop is true,
      // the data is always valid
      // and does not need to be re-computed
      validate: true,
      dependsOn: ['parent'],
      shareAcrossSpecs: true,
    }
    cy.dataSession(childOptions)
      .then(() => {
        const childDataSession = Cypress.getDataSessionDetails('child')
        // check the data session information in the plugin file
        const dataKey = Cypress.formDataSessionKey('child')
        cy.task('dataSession:load', dataKey).should(
          'deep.equal',
          childDataSession,
        )
      })
      .then(() => {
        const childDataSession = Cypress.getDataSessionDetails('child')
        expect(childDataSession)
          .to.have.property('dependsOnTimestamps')
          .to.be.an('Array')
          .and.have.length(1)

        cy.get('@parentSetup')
          .should('be.calledOnce')
          .invoke('resetHistory')
          .then(() => {
            // confirm the internals
            const parentDataSession = Cypress.getDataSessionDetails('parent')
            expect(parentDataSession).to.have.keys(
              'data',
              'timestamp',
              'dependsOnTimestamps',
              'setupHash',
            )
            expect(parentDataSession).to.have.property('data', 1)
            expect(parentDataSession)
              .to.have.property('dependsOnTimestamps')
              .to.be.an('Array').to.be.empty
            const parentTimestamp = parentDataSession.timestamp
            expect(parentTimestamp, 'parent timestamp').to.be.a('number')
            expect(
              childDataSession.dependsOnTimestamps[0],
              'child has parent timestamp',
            ).to.equal(parentTimestamp)

            cy.get('@childSetup')
              .should('be.calledOnce')
              .invoke('resetHistory')
              .then(() => {
                cy.log('recomputing the parent')
                cy.dataSession(parentOptions)
                // the parent data is re-computed because it does not have
                // the "validate" property
                cy.get('@parentSetup')
                  .should('be.calledOnce')
                  .then(() => {
                    const newParentDataSession =
                      Cypress.getDataSessionDetails('parent')
                    expect(newParentDataSession).to.have.keys(
                      'data',
                      'timestamp',
                      'dependsOnTimestamps',
                      'setupHash',
                    )
                    expect(newParentDataSession).to.have.property('data', 1)
                    const newParentTimestamp = newParentDataSession.timestamp
                    expect(newParentTimestamp, 'new parent timestamp').to.be.a(
                      'number',
                    )
                    expect(
                      newParentTimestamp,
                      'new timestamp > prev timestamp',
                    ).to.be.greaterThan(parentTimestamp)

                    // and the child data should be recomputed
                    // since it depends on the parent, and the parent was recomputed
                    cy.dataSession(childOptions)
                    cy.get('@childSetup').should('be.calledOnce')
                  })
              })
          })
      })
  })
})
