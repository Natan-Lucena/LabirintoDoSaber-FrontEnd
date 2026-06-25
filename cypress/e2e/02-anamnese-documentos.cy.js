/// <reference types="cypress" />

/*
 * Suíte: HU06 / HU07 / HU08 / HU09 — Anamnese e Documentos
 *
 * Cada teste afirma o RESULTADO ESPERADO do QA_BUGS.md. Nesta branch defeituosa
 * os testes DEVEM FALHAR, evidenciando o bug.
 *
 * Dependência de dados: BUG-09/11/12 exigem que o aluno possua um MODELO de
 * anamnese aplicado com o respectivo tipo de pergunta (múltipla escolha,
 * obrigatória e upload de arquivo). Ajuste os nomes conforme o ambiente.
 */

const SITE = "https://labirintodosaber.vercel.app/";

const ALUNO_DOC = Cypress.env("ALUNO_COM_DOCUMENTOS") || "Pedro Henrique";
const MODELO_ANAMNESE = "Anamnese Autismo Infantil";
const PERGUNTA_MC = "Qual o nível de comunicação verbal?";
const RESPOSTA_MC = "Frases completas";

// Seleciona um modelo na aba Anamnese caso o seletor (dropdown) esteja visível.
function garantirModeloSelecionado(nomeModelo) {
  cy.get("body").then(($body) => {
    if ($body.find(".anamnese-dropdown-trigger").length) {
      cy.get(".anamnese-dropdown-trigger").click();
      cy.get(".anamnese-dropdown-search").type(nomeModelo);
      cy.contains(".anamnese-dropdown-item", nomeModelo).click();
    }
  });
}

describe("Anamnese e Documentos — defeitos semeados", () => {
  beforeEach(() => {
    cy.visit(SITE);
    cy.login();
  });

  it("BUG-08 (CT 7.1) — aba Documentos deve listar os relatórios já gerados", () => {
    // Entrada: aluno "Pedro Henrique" com 2 relatórios pedagógicos.
    cy.abrirPerfilAluno(ALUNO_DOC);
    cy.contains(".tab-btn", "Documentos").click();

    // Resultado esperado: lista com itens de documento.
    // BUG-08: condição do estado vazio invertida — mostra "Nenhum relatório gerado ainda".
    cy.get(".doc-list .doc-item", { timeout: 20000 }).should(
      "have.length.greaterThan",
      0
    );
    cy.contains("Nenhum relatório gerado ainda").should("not.exist");
  });

  it("BUG-09 (CT 9.1) — resposta de Múltipla Escolha da anamnese deve exibir a opção marcada", () => {
    // Entrada: anamnese com a pergunta MC e a opção "Frases completas" selecionada.
    cy.abrirPerfilAluno(ALUNO_DOC);
    cy.contains(".tab-btn", "Anamnese").click();
    garantirModeloSelecionado(MODELO_ANAMNESE);

    // Resultado esperado: a resposta exibida é "Frases completas".
    // BUG-09: a busca usa o campo errado (selectedOptionIds) e exibe "—".
    cy.contains(".anamnese-q-row", PERGUNTA_MC, { timeout: 20000 })
      .find(".anamnese-q-answer")
      .should("have.text", RESPOSTA_MC);
  });

  it("BUG-10 (CT 8.1) — 'Resposta obrigatória' deve persistir após salvar o modelo", () => {
    const titulo = "Anamnese QA BUG-10";

    cy.visit("/anamnese");
    cy.get(".anamnese-create-btn", { timeout: 20000 }).click();
    cy.location("pathname").should("match", /anamnese\/criar/i);

    cy.get('input[placeholder="Ex: Anamnese Autismo Infantil"]').type(titulo);
    cy.get(".anamnese-add-question-btn").click();
    cy.get('input[placeholder="Digite a pergunta..."]').type(
      "Nome completo da criança"
    );
    // Marca "Resposta obrigatória".
    cy.get('.anamnese-required-label input[type="checkbox"]').check();

    cy.get(".anamnese-form-save-btn").click();
    cy.location("pathname", { timeout: 20000 }).should("match", /\/anamnese$/i);

    // Reabre o modelo recém-criado para editar.
    cy.contains(".anamnese-card", titulo)
      .find('.anamnese-icon-btn[title="Editar"]')
      .click();

    // Resultado esperado: o checkbox de obrigatório continua marcado.
    // BUG-10: buildPayload envia required:false fixo — volta desmarcado.
    cy.get('.anamnese-required-label input[type="checkbox"]', {
      timeout: 20000,
    }).should("be.checked");
  });

  it("BUG-11 (CT 8.4) — salvar anamnese com campo obrigatório vazio deve exibir erro", () => {
    // Entrada: deixar a pergunta obrigatória "Queixa principal" em branco e Salvar.
    // Pré-condição: o modelo aplicado ao aluno possui uma pergunta obrigatória.
    cy.abrirPerfilAluno(ALUNO_DOC);
    cy.contains(".tab-btn", "Anamnese").click();
    garantirModeloSelecionado(MODELO_ANAMNESE);

    cy.get(".btn-editar-anamnese", { timeout: 20000 }).click();
    cy.location("pathname", { timeout: 20000 }).should(
      "match",
      /anamnese\/responder/i
    );

    // Salva sem preencher os obrigatórios.
    cy.get(".ar-save-btn").click();

    // Resultado esperado: mensagem de erro de campo obrigatório.
    // BUG-11: a validação foi invertida (!q.required) e o erro não aparece (salva).
    cy.get(".ar-error", { timeout: 20000 })
      .should("be.visible")
      .and("contain", "obrigatóri");
    cy.location("pathname").should("match", /anamnese\/responder/i);
  });

  it("BUG-12 (CT 6.1) — após upload, o link 'Arquivo enviado — ver' deve aparecer", () => {
    // Entrada: pergunta "Anexe o laudo médico"; arquivo laudo_neuro.pdf.
    // Pré-condição: o modelo aplicado possui uma pergunta do tipo Envio de Arquivo.
    cy.abrirPerfilAluno(ALUNO_DOC);
    cy.contains(".tab-btn", "Anamnese").click();
    garantirModeloSelecionado(MODELO_ANAMNESE);

    cy.get(".btn-editar-anamnese", { timeout: 20000 }).click();
    cy.location("pathname", { timeout: 20000 }).should(
      "match",
      /anamnese\/responder/i
    );

    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/laudo_neuro.pdf",
      { force: true }
    );

    // Resultado esperado: link do arquivo enviado é exibido.
    // BUG-12: onUploaded usa res.data.fileUrl (inexistente) — o link nunca aparece.
    cy.get(".ar-file-uploaded-link", { timeout: 20000 })
      .should("be.visible")
      .and("contain", "Arquivo enviado");
  });
});
