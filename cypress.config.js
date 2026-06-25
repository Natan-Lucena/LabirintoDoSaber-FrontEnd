const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // O passo-a-passo dos bugs sempre parte do site publicado.
    baseUrl: "https://labirintodosaber.vercel.app",
    defaultCommandTimeout: 12000,
    pageLoadTimeout: 60000,
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    // As credenciais e a massa de dados ficam em cypress.env.json (não versionado).
    // Veja cypress.env.example.json.
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
