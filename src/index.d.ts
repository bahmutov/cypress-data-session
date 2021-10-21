// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare namespace Cypress {
  interface DataSessionOptions {
    name: string
    preSetup?: Function
    setup: Function
    validate?: Validate | boolean
    onInvalidated?: Function
    recreate?: Function
    shareAcrossSpecs?: boolean
    dependsOn?: string | string[]
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
      validate?: Validate | boolean,
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
    getDataSessionDetails: (name: string) => any
    setDataSession: (name: string, data: any) => void
    clearDataSession: (name: string) => void
    /**
     * Without any arguments lists all current data sessions.
     */
    dataSessions: (enable?: boolean) => void
    formDataSessionKey: (name: string) => string
  }
}
