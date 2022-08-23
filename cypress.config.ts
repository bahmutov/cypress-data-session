import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: false,
  e2e: {
    setupNodeEvents(on, config) {
      require('./src/plugin')(on, config)
    },
    supportFile: false,
    excludeSpecPattern: 'utils.js',
  },
})
