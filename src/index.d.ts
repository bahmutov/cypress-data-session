// load type definitions that come with Cypress module
/// <reference types="cypress" />
declare namespace Cypress {
  interface Chainable {
    /**
     * Initialize and cache the data.
     * @param name string
     * @param setup Cypress function to create the data
     * @param validate Cypress function that yields a boolean
     */
    dataSession(
      name: string,
      setup: Function,
      validate: (x: any) => Chainable<boolean>,
    ): Chainable<any>
  }
}
