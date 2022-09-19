// @ts-check

import '../../src'

describe('get data', () => {
  it('creates data session', () => {
    const projectName = `my random project ${Cypress._.random(1e4)}`
    // this test prints a new random name,
    // but the data session is the same
    // after the first run
    cy.log(projectName)
    cy.dataSession({
      name: 'project name',
      setup() {
        return projectName
      },
      shareAcrossSpecs: true,
    }).then(cy.log)
  })

  it('get the data session', () => {
    cy.dataSession('project name').then(cy.log)
  })
})
