/// <reference types="cypress" />

/*
 * Suíte: HU10 / HU11 — Agenda de Atendimentos
 *
 * Cada teste afirma o RESULTADO ESPERADO do QA_BUGS.md. Nesta branch defeituosa
 * os testes DEVEM FALHAR, evidenciando o bug.
 *
 * Dependência de dados:
 *  - BUG-14: o dia selecionado precisa ter >= 2 sessões agendadas.
 *  - BUG-20: precisa existir um dia (visível no mês atual) cujo único
 *            agendamento foi cancelado/excluído (ex.: dia 28).
 */

const SITE = "https://labirintodosaber.vercel.app/";
const ALUNO = Cypress.env("ALUNO_COM_SESSOES") || "Maria Silva";

describe("Agenda — defeitos semeados", () => {
  beforeEach(() => {
    cy.visit(SITE);
    cy.login();
  });

  it("BUG-13 (CT 10.2) — agendar sem horário deve exibir erro de validação", () => {
    cy.visit("/agenda");
    cy.get(".agenda-new-btn", { timeout: 20000 }).click();
    cy.get(".agenda-modal-box").should("be.visible");

    // Entrada: aluno + data preenchidos, horário em branco.
    cy.get("select.agenda-field-input").select(ALUNO);
    cy.get('.agenda-field-input[type="date"]').type("2026-06-30");
    // (horário deixado em branco propositalmente)

    cy.get(".agenda-modal-save").click();

    // Resultado esperado: erro "Informe a data e o horário." e salvamento bloqueado.
    // BUG-13: validação de horário removida — monta Invalid Date e não exibe o erro.
    cy.get(".agenda-modal-error", { timeout: 20000 })
      .should("be.visible")
      .and("contain", "Informe a data e o horário");
  });

  it("BUG-14 (CT 11.1) — 'Primeira/Última Sessão' do resumo devem bater com a ordem do dia", () => {
    cy.visit("/agenda");

    // A lista de sessões do dia já vem ordenada por horário (ascendente).
    cy.get(".agenda-session-card .agenda-session-time span", {
      timeout: 20000,
    }).then(($times) => {
      const horarios = [...$times].map((t) => t.innerText.trim());
      expect(
        horarios.length,
        "selecione um dia com pelo menos 2 sessões agendadas"
      ).to.be.at.least(2);

      const primeira = horarios[0];
      const ultima = horarios[horarios.length - 1];

      // Resultado esperado: resumo coerente com a ordem cronológica.
      // BUG-14: firstSession/lastSession foram trocados no resumo.
      cy.contains(".agenda-summary-row", "Primeira Sessão")
        .find("strong")
        .should("have.text", primeira);
      cy.contains(".agenda-summary-row", "Última Sessão")
        .find("strong")
        .should("have.text", ultima);
    });
  });

  it("BUG-20 (CT 11.1) — dia somente com agendamento cancelado NÃO deve ficar marcado", () => {
    cy.visit("/agenda");

    // Entrada: dia 28 cujo único agendamento foi cancelado/excluído (mês visível).
    // Resultado esperado: o dia não recebe a marcação (classe "marked").
    // BUG-20: markedDates passou a usar todos os agendamentos (inclui cancelados).
    cy.get(".mini-cal-day")
      .not(".outside")
      .contains(/^28$/)
      .should("not.have.class", "marked");
  });
});
