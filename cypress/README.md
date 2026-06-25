# Testes Cypress — Defeitos de QA (branch `feat/qa-docs`)

Testes E2E que reproduzem os **20 defeitos** documentados em `QA_BUGS.md`.

> ⚠️ **Importante:** cada teste afirma o **Resultado Esperado** (comportamento correto).
> Por isso, ao rodar **nesta branch** (com os bugs semeados) os testes **devem FALHAR** —
> é justamente essa falha que evidencia o defeito. Em uma branch corrigida, eles passam.

## Pré-requisitos

1. Instalar o Cypress:
   ```bash
   npm install
   ```
2. Criar o arquivo `cypress.env.json` na raiz (copie de `cypress.env.example.json`) com
   credenciais válidas e a massa de dados do ambiente:
   ```json
   {
     "USER_EMAIL": "seu-email@exemplo.com",
     "USER_PASSWORD": "sua-senha",
     "ALUNO_COM_SESSOES": "Maria Silva",
     "ALUNO_6_SESSOES": "João Pedro",
     "ALUNO_SEM_SESSOES": "Lucas Andrade",
     "ALUNO_HISTORICO": "Ana Beatriz",
     "ALUNO_COM_DOCUMENTOS": "Pedro Henrique"
   }
   ```

## Execução

```bash
npm run cy:open   # modo interativo
npm run cy:run    # headless (terminal)
```

Todos os testes fazem, no `beforeEach`:
```js
cy.visit('https://labirintodosaber.vercel.app/');
cy.login();
```

## Mapa Spec → Bugs

| Arquivo | Bugs cobertos |
|---|---|
| `e2e/01-relatorios.cy.js` | BUG-01, 02, 03, 04, 05, 06, 07 |
| `e2e/02-anamnese-documentos.cy.js` | BUG-08, 09, 10, 11, 12 |
| `e2e/03-agenda.cy.js` | BUG-13, 14, 20 |
| `e2e/04-sessao-atividades.cy.js` | BUG-15, 16, 17, 18, 19 |

## Observações sobre dependência de dados

Alguns casos exigem massa de dados específica no ambiente (descrita nos comentários
de cada teste e no campo **Entrada** do `QA_BUGS.md`), por exemplo:

- **BUG-04**: a inversão "acertos × questões" ocorre **dentro do PDF**. O teste valida a
  geração/download do arquivo; a conferência numérica do conteúdo é feita abrindo o PDF.
- **BUG-06/07**: a tela `/ReportPacient` não possui entrada na UI atual; o teste obtém o
  `patientId` pela resposta de `/student` e injeta o state no history.
- **BUG-09/11/12**: o aluno precisa ter um modelo de anamnese aplicado com perguntas de
  Múltipla Escolha, obrigatória e Upload de Arquivo, respectivamente.
- **BUG-14**: o dia selecionado precisa ter ≥ 2 sessões; **BUG-20** precisa de um dia
  (no mês visível) cujo único agendamento foi cancelado.
- **BUG-15/17/19**: dependem das atividades citadas existirem com enunciado/alternativas
  (e imagem, no BUG-17) correspondentes.
