import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: false,
  e2e: {
    setupNodeEvents(on, config) {
      require('./src/plugin')(on, config)
      // IMPORTANT: return the config object
      return config
    },
    supportFile: false,
    excludeSpecPattern: 'utils.js',
  },
})
