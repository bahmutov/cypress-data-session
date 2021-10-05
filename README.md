# cypress-data-session
[![ci status][ci image]][ci url] [![renovate-app badge][renovate-badge]][renovate-app] ![cypress version](https://img.shields.io/badge/cypress-8.5.0-brightgreen)
> Cypress command for flexible test data setup

## Videos

- [Introduction to cypress-data-session package](https://youtu.be/As5yqkoZOx8)
- [Use Data Alias Created Automatically By cypress-data-session](https://youtu.be/VQtjDGCuRzI)
- [Create User Using cypress-data-session Command](https://youtu.be/P-sb5OHSNsM)
- [Invalidate cy.session From cypress-data-session](https://youtu.be/SyDz6l_EFoc)
- [Share Data Across Specs Using cypress-data-session Plugin](https://youtu.be/ws4TitQJ7fQ)
- [Use cy.dataSession To Create A User And Log In](https://youtu.be/PTlcRBgFJaM)

## Install

```shell
$ npm install -D cypress-data-session
# or using Yarn
$ yarn add -D cypress-data-session
```

Import this package from the spec or from the support file

```js
// cypress/support/index.js
import 'cypress-data-session'
```

If you plan to use the [shareAcrossSpecs](#shareacrossspecs) option, you need to load this plugin from your plugin file

```js
// cypress/plugin/index.js
module.exports = (on, config) => {
  require('cypress-data-session/src/plugin')(on, config)
}
```

### Types

If using JavaScript, point the spec at this package using the `///` comment

```js
// cypress/integration/spec.js
/// <reference types="cypress-data-session" />
```

See [src/index.d.ts](./src/index.d.ts)

## Use

This example comes from [cypress/integration/spec.js](./cypress/integration/spec.js)

```js
beforeEach(() => {
  // let's say you want to set up the value "A"
  cy.dataSession(
    'A', // data name
    () => 'a', // data creation commands
    (x) => x === 'a', // data validation function
  )
})

it('has object A', () => {
  expect(Cypress.getDataSession('A')).to.equal('a')
})
```

The value is automatically added as an alias, so you can use `function () { ... }` syntax for the test callback and access the above value using `this.A` property

```js
it('exists under an alias', function () {
  expect(this.A).to.equal('a')
})
```

### validate

The `validate` predicate can use Cypress commands, but must ultimately yield a boolean value.

```js
// validate a room id by fetching it from the database
// using cy.task and finding the room
const validate = (id) => {
  return cy.task('getRooms', null, { log: false }).then((rooms) => {
    // important: make sure to return a Boolean
    // otherwise _.find returns undefined
    // and Cypress cy.then callback returns the previous value
    return Boolean(Cypress._.find(rooms, { _id: id }))
  })
}
```

The `validate` function is optional. If you skip it, the `setup` will be run every time.

```js
// without "validate" function, the "setup" runs every time
cy.dataSession(name, setup)
```

You can also pass a boolean value, which is useful during debugging.

```js
validate: true // no need to recompute the value, it is still valid
validate: false // call setup again
```

See [cypress/integration/validate.js](./cypress/integration/validate.js) spec.

### onInvalidated

You can pass a function as the last argument to the `cy.dataSession` to be called if the "validate" returns false. This function will be called _before_ the "setup" function executes.

```js
function onInvalidated() {
  // clear user session for example
}
cy.dataSession(name, setupUser, validateUser, onInvalidated)
```

See an example in the spec [cypress/integration/invalidate.js](./cypress/integration/invalidate.js) and video [Invalidate cy.session From cypress-data-session](https://youtu.be/SyDz6l_EFoc).

### Options object

You can pass multiple parameters using a single options object, see [cypress/integration/options.js](./cypress/integration/options.js)

```js
cy.dataSession({
  name: 'C',
  setup: () => 'c',
  validate: (x) => x === 'c',
})
```

### recreate

Using the options object you can pass another function to be called after the `validate` yields true. This function let's you to perform Cypress commands with the validated value to "finish" the recreation. For example, you could visit the page after setting the cookie from the data session to end on the page, just like the `setup` does.

```js
cy.dataSession({
  name: 'logged in',
  setup: () => {
    // create user, visit the page, log in
    // let's say we are on the page '/home
    // save the cookie in the data session
    cy.getCookie('connect.sid')
  },
  // assume the cookie is valid
  validate: (c) => true,
  recreate (cookie) => {
    cy.setCookie(cookie)
    cy.visit('/home')
  }
})
```

### shareAcrossSpecs

By default, the data session value is saved inside `Cypress.env` object. This object is reset whenever the spec gets reloaded (think Cmd+R press or the full browser reload). The object is gone when the `cypress run` finishes with a spec and opens another one. If you want the data value to persist across the browser reloads, or be shared across specs, use the `shareAcrossSpecs: true` option.

```js
cy.dataSession({
  name: 'shared value',
  setup: () => 'a',
  validate: (x) => x === 'a',
  shareAcrossSpecs: true,
})
```

The first spec that creates it, saves it in the plugin file process. Then other specs can re-use this value (after validation, of course).

### preSetup

Sometimes you might need to run a few steps before the `setup` commands. While you could have these commands inside the `setup` function, it might make clear to anyone reading the code that these commands are preparing the data for the `setup` function. For example, you could check if the user you are about to create exists already and needs to be deleted first.

```js
cy.dataSession({
  name: 'user',
  preSetup () {
    cy.task('findUser', 'Joe').then((user) => {
      if (user) {
        cy.task('deleteUser', user._id)
      }
    })
  },
  setup () {
    // create the user "Joe"
  },
  validate (saved) {
    // check if the user "Joe" exists
  }
})
```

### dependsOn

A data session can depend on another data session or even multiple data sessions. For example, the data session "logged in user" can depend on the "created user" data session. If the "parent" session changes, we need to recompute all sessions that depend on it.

```js
cy.dataSession({
  name: 'created user',
  setup () {
    // create a user
  }
})

cy.dataSession({
  name: 'logged in user',
  dependsOn: 'created user',
  setup () {
    // take the user object from
    // the data session "created user"
    // and log in
  }
})
```

If the "created user" gets invalidated and recomputed (its `setup` method runs again), then the data session "logged in user" is invalidated automatically.

To list dependencies on multiple data sessions, pass an array of names

```js
dependsOn: ['first', 'second', 'third']
```

## Examples

- [bahmutov/chat.io](https://github.com/bahmutov/chat.io)

## Global methods

A few global utility methods are added to the `Cypress` object for accessing the data sessions. These methods are mostly utilities used internally.

- `Cypress.getDataSession(name)`
- `Cypress.clearDataSession(name)`
- `Cypress.dataSessions(enable)`
- `Cypress.setDataSession(name, value)`

## Debugging

This plugin uses [debug](https://github.com/visionmedia/debug#readme) module to output verbose messages. Start Cypress with the environment variable `DEBUG=cypress-data-session` to see them. How to set an environment variable depends on the operating system. From a Linux terminal we can use

```shell
$ DEBUG=cypress-data-session npx cypress open
```

## See also

Custom command creation and publishing to NPM described in these blog posts:

- [Writing a Custom Cypress Command](https://glebbahmutov.com/blog/writing-custom-cypress-command/)
- [How to Publish Custom Cypress Command on NPM](https://glebbahmutov.com/blog/publishing-cypress-command/)

## Small print

Author: Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt; &copy; 2021

- [@bahmutov](https://twitter.com/bahmutov)
- [glebbahmutov.com](https://glebbahmutov.com)
- [blog](https://glebbahmutov.com/blog)
- [videos](https://www.youtube.com/glebbahmutov)
- [presentations](https://slides.com/bahmutov)
- [cypress.tips](https://cypress.tips)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/cypress-data-session/issues) on Github

## MIT License

Copyright (c) 2021 Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

[ci image]: https://github.com/bahmutov/cypress-data-session/workflows/ci/badge.svg?branch=main
[ci url]: https://github.com/bahmutov/cypress-data-session/actions
[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/