/// <reference types="cypress" />

/*
 * Suíte: HU04 / HU12 / HU13 / HU14 — Execução de Sessão e Atividades
 *
 * Cada teste afirma o RESULTADO ESPERADO do QA_BUGS.md. Nesta branch defeituosa
 * os testes DEVEM FALHAR, evidenciando o bug.
 *
 * Dependência de dados: as atividades abaixo precisam existir no ambiente com
 * o enunciado/alternativas indicados (e a atividade do BUG-17 deve ter imagem).
 */

const SITE = "https://labirintodosaber.vercel.app/";
const PACIENTE = Cypress.env("ALUNO_COM_SESSOES") || "Maria Silva";

const ATV_TROCA = "Qual animal começa com a letra G?"; // alternativas Gato / Girafa
const ATV_SIMPLES = "Selecione a vogal A";
const ATV_IMAGEM = "Identifique a figura"; // atividade com imagem
const ATV_CORRETA = "Quantas vogais tem a palavra ESCOLA?"; // alternativa correta = 3

describe("Sessão e Atividades — defeitos semeados", () => {
  beforeEach(() => {
    cy.visit(SITE);
    cy.login();
  });

  it("BUG-15 (CT 13.2) — deve ser possível trocar a alternativa antes de confirmar", () => {
    cy.iniciarSessaoComAtividade({
      paciente: PACIENTE,
      nomeSessao: "QA BUG-15",
      atividade: ATV_TROCA,
    });

    // Entrada: marcar "Gato" e, antes de confirmar, trocar para "Girafa".
    cy.contains(".session-option-btn", "Gato").click();
    cy.contains(".session-option-btn", "Girafa").click();

    // Resultado esperado: "Girafa" passa a ser a alternativa selecionada.
    // BUG-15: handleOptionSelect só atribui se nada estiver selecionado — a troca não ocorre.
    cy.contains(".session-option-btn", "Girafa").should(
      "have.class",
      "option-selected"
    );
    cy.contains(".session-option-btn", "Gato").should(
      "not.have.class",
      "option-selected"
    );
  });

  it("BUG-16 (CT 12.1) — o tempo de resposta enviado deve corresponder ao tempo real", () => {
    cy.intercept("POST", "**/task-notebook-session/answer").as("answer");

    cy.iniciarSessaoComAtividade({
      paciente: PACIENTE,
      nomeSessao: "QA BUG-16",
      atividade: ATV_SIMPLES,
    });

    // Responde após ~3 segundos.
    cy.wait(3000);
    cy.get(".session-option-btn").first().click();
    cy.contains("button", "Confirmar Resposta").click();

    // Resultado esperado: timeToAnswer ~3s (faixa tolerante de 2 a 8s).
    // BUG-16: divisão por 100 em vez de 1000 => ~30s (10x maior).
    cy.wait("@answer")
      .its("request.body.timeToAnswer")
      .should("be.within", 2, 8);
  });

  it("BUG-17 (CT 14.1) — clicar fora da imagem ampliada deve fechar o modal", () => {
    cy.iniciarSessaoComAtividade({
      paciente: PACIENTE,
      nomeSessao: "QA BUG-17",
      atividade: ATV_IMAGEM,
    });

    cy.get(".activity-main-image").click();
    cy.get(".lightbox-overlay").should("be.visible");

    // Clica na área externa (canto), fora do conteúdo central.
    cy.get(".lightbox-overlay").click("topLeft");

    // Resultado esperado: o modal de ampliação fecha.
    // BUG-17: onClick do overlay chama setOpen(true) — o modal não fecha.
    cy.get(".lightbox-overlay").should("not.exist");
  });

  it("BUG-18 (CT 4.1) — a observação da sessão deve ser enviada no campo 'observation'", () => {
    const TEXTO =
      "Sessão produtiva, paciente colaborativo e atento durante toda a atividade.";
    cy.intercept("POST", "**/task-notebook-session/observation").as("obs");

    cy.iniciarSessaoComAtividade({
      paciente: PACIENTE,
      nomeSessao: "QA BUG-18",
      atividade: ATV_SIMPLES,
    });

    // Responde e encerra a sessão (atividade única => "Encerrar Sessão").
    cy.get(".session-option-btn").first().click();
    cy.contains("button", "Confirmar Resposta").click();
    cy.contains("button", "Encerrar Sessão").click();

    // Modal de encerramento.
    cy.get(".session-obs-modal", { timeout: 20000 }).should("be.visible");
    cy.get(".session-obs-textarea").type(TEXTO);
    cy.get(".session-obs-btn-save").click();

    // Resultado esperado: corpo do POST contém a propriedade "observation".
    // BUG-18: o front envia { obs: ... } — a observação não é persistida.
    cy.wait("@obs")
      .its("request.body")
      .should("have.property", "observation", TEXTO);
  });

  it("BUG-19 (CT 12.2) — alternativa correta deve ser destacada como correta (verde)", () => {
    cy.iniciarSessaoComAtividade({
      paciente: PACIENTE,
      nomeSessao: "QA BUG-19",
      atividade: ATV_CORRETA,
    });

    // Entrada: marcar e confirmar a alternativa correta "3".
    cy.contains(".session-option-btn", /^\s*3\s*$/).click();
    cy.contains("button", "Confirmar Resposta").click();

    // Resultado esperado: a alternativa correta recebe a classe "option-correct".
    // BUG-19: feedback invertido (feedback === false) — a correta vira "option-incorrect".
    cy.contains(".session-option-btn", /^\s*3\s*$/).should(
      "have.class",
      "option-correct"
    );
  });
});
