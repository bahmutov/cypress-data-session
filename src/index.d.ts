// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare namespace Cypress {
  interface DataSessionOptions {
    name: string
    setup: Function
    validate: Validate
    onInvalidated?: Function
    shareAcrossSpecs?: boolean
  }

  type Validate = ((x: any) => Chainable<boolean>) | ((x: any) => boolean)

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
      validate: Validate,
      onInvalidated?: Function,
    ): Chainable<any>

    /**
     * Initialize and cache the data.
     * @param options with name, setup, validate, and onInvalidated
     */
    dataSession(options: DataSessionOptions): Chainable<any>
  }

  // utility global methods added to Cypress global object
  interface Cypress {
    getDataSession: (name: string) => any
    clearDataSession: (name: string) => void
    dataSessions: (enable: boolean) => void
  }
}
