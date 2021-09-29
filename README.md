# cypress-data-session
[![ci status][ci image]][ci url] [![renovate-app badge][renovate-badge]][renovate-app] ![cypress version](https://img.shields.io/badge/cypress-8.5.0-brightgreen)
> Cypress command for flexible test data setup

## Videos

- [Introduction to cypress-data-session package](https://youtu.be/As5yqkoZOx8)
- [Use Data Alias Created Automatically By cypress-data-session](https://youtu.be/VQtjDGCuRzI)
- [Create User Using cypress-data-session Command](https://youtu.be/P-sb5OHSNsM)

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

### Types

If using JavaScript, point the spec at this package using the `///` comment

```js
// cypress/integration/spec.js
/// <reference types="cypress-data-session" />
```

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

### onInvalidated

You can pass a function as the last argument to the `cy.dataSession` to be called if the "validate" returns false. This function will be called _before_ the "setup" function executes.

```js
function onInvalidated() {
  // clear user session for example
}
cy.dataSession(name, setupUser, validateUser, onInvalidated)
```

## Examples

- [bahmutov/chat.io](https://github.com/bahmutov/chat.io)

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
