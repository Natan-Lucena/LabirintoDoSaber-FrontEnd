/// <reference types="cypress" />

/*
 * Suíte: HU01 / HU02 / HU03 / HU05 — Relatórios
 *
 * IMPORTANTE: cada teste afirma o RESULTADO ESPERADO descrito no QA_BUGS.md.
 * Nesta branch (com os defeitos semeados) os testes DEVEM FALHAR — é assim que
 * o caso de teste evidencia o bug. O comentário "BUG-XX" indica o resultado
 * encontrado na branch defeituosa.
 *
 * A massa de dados (nomes de alunos, sessões) vem de cypress.env.json.
 */

const SITE = "https://labirintodosaber.vercel.app/";

const ALUNO_COM_SESSOES = Cypress.env("ALUNO_COM_SESSOES") || "Maria Silva";
const ALUNO_6_SESSOES = Cypress.env("ALUNO_6_SESSOES") || "João Pedro";
const ALUNO_SEM_SESSOES = Cypress.env("ALUNO_SEM_SESSOES") || "Lucas Andrade";
const ALUNO_HISTORICO = Cypress.env("ALUNO_HISTORICO") || "Ana Beatriz";

// Converte "dd/mm/aaaa" em Date (ordenação de histórico).
function parseBr(str) {
  const [d, m, y] = str.split("/").map(Number);
  return new Date(y, m - 1, d).getTime();
}

describe("Relatórios — defeitos semeados", () => {
  beforeEach(() => {
    cy.visit(SITE);
    cy.login();
  });

  it("BUG-01 (CT 1.1) — taxa de acerto da prévia deve refletir o desempenho real", () => {
    // Entrada: aluno "Maria Silva" com a sessão "Leitura — Vogais" (8 acertos em 10).
    cy.selecionarAlunoNoRelatorio(ALUNO_COM_SESSOES);

    cy.get(".sessions-preview-list", { timeout: 20000 }).should("be.visible");

    // Resultado esperado: 8/10 => "80% acerto".
    // BUG-01: a porcentagem aparece como "0% acerto" (perda do *100).
    cy.contains(".session-preview-item", "8/10")
      .find(".session-score-pct")
      .should("have.text", "80% acerto");
  });

  it("BUG-02 (CT 1.3) — período 'Últimas 6 sessões' deve considerar 6 sessões", () => {
    // Entrada: aluno com 6 sessões; clicar no período "Últimas 6 sessões".
    cy.selecionarAlunoNoRelatorio(ALUNO_6_SESSOES);

    cy.contains(".period-option", "Últimas 6 sessões").click();

    // Resultado esperado: badge "6 sessões".
    // BUG-02: o limite foi alterado para 3, exibindo "3 sessões".
    cy.get(".sessions-badge", { timeout: 20000 }).should("contain", "6 sessões");
  });

  it("BUG-03 (CT 3.2) — exportar relatório sem sessões deve ser bloqueado por modal", () => {
    // Entrada: aluno "Lucas Andrade" sem sessões; clicar em Exportar PDF.
    cy.selecionarAlunoNoRelatorio(ALUNO_SEM_SESSOES);

    cy.get(".export-pdf-button").click();

    // Resultado esperado: modal de aviso "Nenhuma sessão encontrada".
    // BUG-03: a guarda 'length < 0' impede o modal de aparecer.
    cy.get(".modal-box", { timeout: 20000 }).should("be.visible");
    cy.get(".modal-title").should("contain", "Nenhuma sessão encontrada");
  });

  it("BUG-04 (CT 3.1) — PDF deve ser gerado e baixado para um aluno com sessões", () => {
    // Entrada: aluno com 24 acertos em 40 questões; 'Métricas de Desempenho' marcado.
    cy.selecionarAlunoNoRelatorio(ALUNO_COM_SESSOES);

    cy.get("#cb-metrics").should("be.checked"); // marcado por padrão
    cy.get(".export-pdf-button").click();

    // O PDF é baixado como "relatorio-<nome>.pdf".
    cy.readFile(`cypress/downloads/relatorio-${ALUNO_COM_SESSOES}.pdf`, {
      timeout: 20000,
    }).should("exist");

    // OBS (BUG-04): a INVERSÃO de "acertos" x "questões respondidas" ocorre dentro
    // do PDF (ex.: "40 acertos de 24 questões"). A verificação numérica do conteúdo
    // do PDF deve ser feita abrindo o arquivo gerado (fora do escopo do E2E de UI).
  });

  it("BUG-05 (CT 5.1) — relatório de sessão deve exibir a observação registrada", () => {
    // Entrada: sessão "Escrita — Sílabas" com observação preenchida.
    cy.selecionarAlunoNoRelatorio(ALUNO_COM_SESSOES);

    cy.get(".sessions-preview-list", { timeout: 20000 }).should("be.visible");
    cy.contains(".session-preview-item", "Escrita").click();

    cy.location("pathname", { timeout: 20000 }).should("match", /ReportSession/i);

    // Resultado esperado: bloco de observações visível com o texto.
    // BUG-05: condição invertida (!observation) — o bloco não aparece quando há observação.
    cy.get(".report-observation-box", { timeout: 20000 }).should("be.visible");
    cy.get(".report-observation-text").should("not.be.empty");
  });

  it("BUG-06 (CT 2.1) — histórico de sessões deve estar em ordem decrescente (mais recente primeiro)", () => {
    // Entrada: aluno "Ana Beatriz" com sessões em datas diferentes.
    cy.abrirRelatorioPaciente(ALUNO_HISTORICO);

    cy.get(".session-item .session-info > p", { timeout: 20000 }).then(($ps) => {
      const datas = [...$ps].map((p) =>
        parseBr(p.innerText.split(" - ")[0].trim())
      );
      expect(datas.length, "precisa de ao menos 2 sessões").to.be.at.least(2);

      const esperado = [...datas].sort((a, b) => b - a); // decrescente
      // BUG-06: a ordenação foi invertida (crescente), quebrando esta igualdade.
      expect(datas).to.deep.equal(esperado);
    });
  });

  it("BUG-07 (CT 2.1) — pílula de acertos deve ficar verde para desempenho > 70%", () => {
    // Entrada: aluno "Ana Beatriz" com 85% de acerto.
    cy.abrirRelatorioPaciente(ALUNO_HISTORICO);

    // Resultado esperado: fundo verde (#81C784 => rgb(129, 199, 132)).
    // BUG-07: o limiar virou '> 100', então fica sempre laranja (rgb(255, 204, 128)).
    cy.contains(".metric-item", "Porcentagem de acertos")
      .find(".metric-pill")
      .should("have.css", "background-color", "rgb(129, 199, 132)");
  });
});
