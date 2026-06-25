// Carrega os comandos customizados (cy.login, helpers de fluxo) em todos os specs.
import "./commands";

// Os bugs seeded podem gerar erros não tratados no app (ex.: BUG-13 com data inválida).
// Não queremos que uma exceção do app derrube o teste antes da nossa asserção.
Cypress.on("uncaught:exception", () => false);
