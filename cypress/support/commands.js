/// <reference types="cypress" />

// ---------------------------------------------------------------------------
// cy.login()
// Preenche o formulário de login (tela "/") e aguarda a navegação para /home.
// É chamado no beforeEach, logo após cy.visit('https://labirintodosaber.vercel.app/').
// ---------------------------------------------------------------------------
Cypress.Commands.add("login", () => {
  const email = Cypress.env("USER_EMAIL");
  const password = Cypress.env("USER_PASSWORD");

  cy.get('input[type="email"]', { timeout: 20000 })
    .should("be.visible")
    .clear()
    .type(email);
  cy.get('input[type="password"]').clear().type(password, { log: false });
  cy.contains("button", "Entrar").click();

  // Após o login bem-sucedido o app redireciona para /home.
  cy.location("pathname", { timeout: 20000 }).should("eq", "/home");
});

// ---------------------------------------------------------------------------
// cy.abrirPerfilAluno(nome)
// Vai para a lista de alunos, busca pelo nome e clica em "Ver Perfil".
// ---------------------------------------------------------------------------
Cypress.Commands.add("abrirPerfilAluno", (nome) => {
  cy.visit("/alunos");
  cy.get(".alunos-search-input", { timeout: 20000 }).clear().type(nome);
  cy.contains(".student-list-item-card", nome)
    .find(".ver-perfil-btn")
    .click();
  cy.location("pathname", { timeout: 20000 }).should(
    "match",
    /alunosDetails/i
  );
});

// ---------------------------------------------------------------------------
// cy.selecionarAlunoNoRelatorio(nome)
// Abre "Relatórios" (/MainReport), busca o aluno no autocomplete e o seleciona.
// ---------------------------------------------------------------------------
Cypress.Commands.add("selecionarAlunoNoRelatorio", (nome) => {
  cy.visit("/MainReport");
  cy.get(".student-search-input", { timeout: 20000 }).click().clear().type(nome);
  cy.contains(".student-dropdown-item", nome).click();
  cy.get(".student-selected-card", { timeout: 20000 }).should("contain", nome);
});

// ---------------------------------------------------------------------------
// cy.iniciarSessaoComAtividade({ paciente, nomeSessao, atividade })
// Percorre todo o fluxo real de sessão até a tela de execução (/sessionInit):
// /Session -> seleciona paciente -> nomeia sessão -> "Selecionar Atividades"
// -> busca/seleciona a atividade -> "Iniciar Sessão".
// ---------------------------------------------------------------------------
Cypress.Commands.add(
  "iniciarSessaoComAtividade",
  ({ paciente, nomeSessao, atividade }) => {
    cy.visit("/Session");

    cy.contains(".patient-list-item-card", paciente, { timeout: 20000 }).click();
    cy.location("pathname", { timeout: 20000 }).should("match", /sessionTitle/i);

    cy.get(".session-name-input").clear().type(nomeSessao);
    cy.contains("button", "Próximo").click();

    cy.contains(".session-option-button", "Selecionar Atividades").click();
    cy.location("pathname", { timeout: 20000 }).should(
      "match",
      /sessionActivities/i
    );

    cy.get('input[placeholder="Buscar atividade..."]', { timeout: 20000 })
      .clear()
      .type(atividade);
    cy.contains(".activity-select-list-item-card", atividade).click();

    cy.contains("button", "Iniciar Sessão").click();
    cy.location("pathname", { timeout: 20000 }).should("match", /sessionInit/i);
    // Aguarda renderizar as alternativas (vêm de GET /task/:id).
    cy.get(".session-option-btn", { timeout: 20000 }).should("exist");
  }
);

// ---------------------------------------------------------------------------
// cy.abrirRelatorioPaciente(nome)
// A tela "/ReportPacient" não possui entrada pela UI atual e depende de
// location.state.patientId. Capturamos o id do aluno pela resposta da listagem
// (/student) e injetamos o state no history antes do app inicializar.
// ---------------------------------------------------------------------------
Cypress.Commands.add("abrirRelatorioPaciente", (nome) => {
  cy.intercept("GET", "**/student*").as("students");
  cy.visit("/alunos");
  cy.wait("@students").then(({ response }) => {
    const data = response.body;
    const lista = Array.isArray(data) ? data : data.students || [];
    const aluno = lista.find((s) => (s.name || "").includes(nome));
    expect(aluno, `aluno "${nome}" deve existir na massa de dados`).to.exist;

    cy.visit("/ReportPacient", {
      onBeforeLoad(win) {
        // react-router lê location.state de window.history.state.usr
        win.history.replaceState({ usr: { patientId: aluno.id } }, "");
      },
    });
    // Se o state não for aplicado, a tela redireciona para /MainReport.
    cy.location("pathname", { timeout: 20000 }).should("match", /ReportPacient/i);
  });
});
