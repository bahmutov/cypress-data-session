// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare namespace Cypress {
  /**
   * Cypress data session options.
   */
  interface DataSessionOptions {
    /**
     * Name of the data session. Note that it will create an alias under this name.
     */
    name: string
    /**
     * Optional function to call IF there is no data session with the given name.
     * Can yield data to be cached by-passing the setup method.
     */
    init?: Function
    /**
     * Usually used together with setup callback to clear the data.
     */
    preSetup?: Function
    /**
     * Callback function with Cypress commands that will be executed if there
     * no data session with the given name. Should yield data to be cached.
     */
    setup: Function
    /**
     * Validates the data yielded by the init or setup callbacks. Used to
     * check if the data is obsolete and should be recomputed.
     */
    validate?: Validate | boolean
    /**
     * If previously we had cached data, and it did not pass the validation,
     * this callback is called.
     */
    onInvalidated?: Function
    /**
     * Called if we have valid cached data and do not need to call the setup.
     * For example, if we have cached cookie, we might call cy.setCookie in the
     * recreate callback.
     */
    recreate?: Function
    /**
     * Stores the cached data in the plugin file so it can survive hard browser reloads
     * and opening a different spec that needs the same data.
     */
    shareAcrossSpecs?: boolean
    /**
     * A data session might require the other data session to still be valid.
     * For example, a logged in user cookie might need the user data session to still
     * be valid. If the user data session is recomputed, it will automatically invalidate
     * the logged in user cookie session that depends on it.
     */
    dependsOn?: string | string[] | null
    /**
     * Print the created or restored value in the Cypress Command Log
     */
    showValue?: boolean
    /**
     * Timeout in milliseconds before the data expires. Counted from the moment of the
     * data session setup.
     */
    expires?: number
    /**
     * Number of calls to `cy.dataSession` for the data until it needs to be computed
     * using the `setup` method again. Useful to cache a shared resource, like
     * a limited number of items to be consumed by the tests.
     * Cannot be used with `shareAcrossSpecs` yet
     * @see https://github.com/bahmutov/cypress-data-session/issues/120
     */
    limit?: number
    /**
     * Call the setup again even if the data session is valid
     * on the test retry.
     */
    recomputeOnRetry?: boolean
  }

  type Validate = ((x: any) => Chainable<boolean>) | ((x: any) => boolean)

  interface DataSession {
    name: string
    value: unknown
  }

  interface Chainable {
    /**
     * Initialize and cache the data session.
     * @param name The data session name
     * @param setup Cypress function to create the data
     * @param validate Cypress function to validate cached data, should return or yield a boolean
     * @param onInvalidated Function to call when the data is invalidated
     * @see https://github.com/bahmutov/cypress-data-session
     */
    dataSession(
      name: string,
      setup: Function,
      validate?: Validate | boolean,
      onInvalidated?: Function,
    ): Chainable<any>

    /**
     * Initialize and cache the data session.
     * @param options with name, setup, validate, and onInvalidated
     * @see https://github.com/bahmutov/cypress-data-session
     */
    dataSession(options: DataSessionOptions): Chainable<any>

    /**
     * Fetches the current value stored for the given data session.
     */
    dataSession(name: string): Chainable<any>
  }

  // utility global methods added to Cypress global object
  interface Cypress {
    /**
     * Returns the value stored for the given data session.
     */
    getDataSession: (name: string) => any
    /**
     * Returns the full data session object including the internal propeties
     */
    getDataSessionDetails: (name: string) => any
    getSharedDataSessionDetails: (name: string) => any
    /**
     * Overwrites the data stored in the given data session
     */
    setDataSession: (name: string, data: any, skipValueCheck?: boolean) => void
    /**
     * Clears a particular session by name. If running inside a test
     * uses `cy.then` to clear the session after the previous command
     * in the chain.
     */
    clearDataSession: (name: string) => Chainable<void>
    /**
     * Clears all data sessions from memory.
     */
    clearDataSessions: () => Chainable<void>
    /**
     * Without any arguments lists all current data sessions.
     */
    dataSessions: (enable?: boolean) => void | DataSession[]
    formDataSessionKey: (name: string) => string
    /**
     * Prints data sessions stored in the plugin space.
     */
    printSharedDataSessions: () => Chainable<void>
  }
}
