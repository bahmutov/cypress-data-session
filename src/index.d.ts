// load type definitions that come with Cypress module
/// <reference types="cypress" />
declare namespace Cypress {
  interface Chainable {
    /**
     * Initialize and cache the data.
     * @param name string
     * @param setup Cypress function to create the data
     * @param validate Cypress function that yields a boolean
     * @param onInvalidated Function to call when the data is invalidated
     */
    dataSession(
      name: string,
      setup: Function,
      validate: (x: any) => Chainable<boolean>,
      onInvalidated?: Function,
    ): Chainable<any>
  }
}
