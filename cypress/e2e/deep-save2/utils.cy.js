export const SESSION_NAME = 'cache-across-specs'
export const registerCacheAcrossSpecs = () => {
  Cypress.Commands.add('cacheAcrossSpecs', (cb) => {
    cy.dataSession({
      name: SESSION_NAME,
      setup: () => {
        cy.log('setting up')
        cb()
        cy.then(() => 'done')
      },
      validate: true,
      shareAcrossSpecs: true,
    })
  })
}
