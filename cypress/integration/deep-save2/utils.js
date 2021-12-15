export const registerCacheAcrossSpecs = () => {
  Cypress.Commands.add('cacheAcrossSpecs', (cb) => {
    cy.dataSession({
      name: 'cache-across-specs',
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
