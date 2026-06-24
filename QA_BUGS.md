# Relatório de Defeitos — Labirinto do Saber (Front-End)

> **Documento de QA / Teste de Defeitos (Bug Seeding)**
> Esta branch (`feat/qa-docs`) contém **20 defeitos inseridos intencionalmente** para fins de
> treinamento e validação do processo de QA. **Não deve ser promovida para produção.**

## Informações gerais da campanha de testes

| Campo | Valor |
|---|---|
| Data da execução | 23/06/2026 |
| Versão do sistema | 0.1.0 |
| Ambiente | Homologação / QA — Front-End (React) |
| Branch | `feat/qa-docs` |
| Versão (navegador) | Google Chrome 126.0 |
| Sistema Operacional | Windows 11 Pro (build 10.0.26200) |
| Responsável | Natan Lucena |
| Tipo de teste | Funcional, Interface e Usabilidade |
| Total de defeitos | 20 |

---

## Índice resumido

| Issue | Caso de Teste | HU | Arquivo | Tipo | Criticidade | Status |
|---|---|---|---|---|---|---|
| BUG-01 | 1.1 | HU01 | `mainReport/index.js` | Funcional | Média | Aberto |
| BUG-02 | 1.3 | HU01 | `mainReport/index.js` | Funcional | Baixa | Aberto |
| BUG-03 | 3.2 | HU03 | `mainReport/index.js` | Funcional | Alta | Aberto |
| BUG-04 | 3.1 | HU03 | `mainReport/ReportPDF.js` | Funcional | Alta | Aberto |
| BUG-05 | 5.1 | HU05 | `ReportSession/index.js` | Funcional | Média | Aberto |
| BUG-06 | 2.1 | HU02 | `ReportPacient/index.js` | Funcional | Média | Aberto |
| BUG-07 | 2.1 | HU02 | `ReportPacient/index.js` | Interface | Baixa | Aberto |
| BUG-08 | 7.1 | HU07 | `patientsDetails/index.js` | Funcional | Média | Aberto |
| BUG-09 | 9.1 | HU09 | `patientsDetails/index.js` | Funcional | Média | Aberto |
| BUG-10 | 8.1 | HU08 | `anamneseForm/index.js` | Funcional | Alta | Aberto |
| BUG-11 | 8.4 | HU08 | `anamneseResponder/index.js` | Funcional | Alta | Aberto |
| BUG-12 | 6.1 | HU06 | `anamneseResponder/index.js` | Funcional | Alta | Aberto |
| BUG-13 | 10.2 | HU10 | `agenda/index.js` | Funcional | Alta | Aberto |
| BUG-14 | 11.1 | HU11 | `agenda/index.js` | Interface | Média | Aberto |
| BUG-15 | 13.2 | HU13 | `sessionInit/index.js` | Funcional | Alta | Aberto |
| BUG-16 | 12.1 | HU12 | `sessionInit/index.js` | Funcional | Alta | Aberto |
| BUG-17 | 14.1 | HU14 | `sessionInit/index.js` | Funcional | Média | Aberto |
| BUG-18 | 4.1 | HU04 | `sessionInit/index.js` | Funcional | Alta | Aberto |
| BUG-19 | 12.2 | HU12 | `sessionInit/index.js` | Interface | Média | Aberto |
| BUG-20 | 11.1 | HU11 | `agenda/index.js` | Interface | Baixa | Aberto |

---

## BUG-01 — Taxa de acerto da prévia exibida sempre como 0%

| Campo | Valor |
|---|---|
| **Issue** | BUG-01 |
| **Caso de Teste** | 1.1 — Criando relatório na aba de relatórios (HU01) |
| **Passos** | 1. Acessar a aba **Relatórios**. 2. Buscar e selecionar um aluno com sessões. 3. Observar a lista "Prévia das Sessões Incluídas". |
| **Entrada** | Aluno com sessões contendo respostas corretas e incorretas (ex.: 8/10 acertos). |
| **Resultado Esperado** | Cada sessão exibe a porcentagem de acerto correta (ex.: `80% acerto`). |
| **Resultado Encontrado** | A porcentagem é exibida como `0% acerto` (ou `100%`) para praticamente todas as sessões. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Média |
| **Status** | Aberto |

**Detalhe técnico:** em `mainReport/index.js`, o cálculo perdeu a multiplicação por 100 (`Math.round(correct / total)` em vez de `Math.round((correct / total) * 100)`).

---

## BUG-02 — Filtro "Últimas 6 sessões" retorna apenas 3 sessões

| Campo | Valor |
|---|---|
| **Issue** | BUG-02 |
| **Caso de Teste** | 1.3 — Selecionando outro período de relatório (HU01) |
| **Passos** | 1. Selecionar um aluno com 6+ sessões. 2. No bloco "Período", clicar em **Últimas 6 sessões**. 3. Conferir a quantidade de sessões na prévia. |
| **Entrada** | Aluno com pelo menos 6 sessões registradas. |
| **Resultado Esperado** | A prévia e o relatório consideram as últimas 6 sessões. |
| **Resultado Encontrado** | Apenas as 3 últimas sessões são consideradas; o badge mostra "3 sessões". |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Baixa |
| **Status** | Aberto |

**Detalhe técnico:** o `limit` da opção `last6` foi alterado de `6` para `3` no array `PERIODS`.

---

## BUG-03 — Exportação de relatório vazio não é bloqueada

| Campo | Valor |
|---|---|
| **Issue** | BUG-03 |
| **Caso de Teste** | 3.2 — Tentando exportar um relatório vazio (HU03) |
| **Passos** | 1. Selecionar um aluno **sem sessões** (ou período sem sessões). 2. Clicar em **Exportar Relatório em PDF**. |
| **Entrada** | Aluno/período sem nenhuma sessão. |
| **Resultado Esperado** | Exibir o modal "Nenhuma sessão encontrada" e **não** gerar PDF. |
| **Resultado Encontrado** | O modal de aviso nunca aparece; o fluxo prossegue e gera um PDF vazio / dispara erro de renderização. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Alta |
| **Status** | Aberto |

**Detalhe técnico:** a guarda `sessionsList.length === 0` foi trocada por `sessionsList.length < 0` (condição nunca verdadeira).

---

## BUG-04 — PDF inverte "acertos" e "questões respondidas"

| Campo | Valor |
|---|---|
| **Issue** | BUG-04 |
| **Caso de Teste** | 3.1 — Exportando um relatório com sucesso (HU03) |
| **Passos** | 1. Selecionar aluno com sessões. 2. Manter "Métricas de Desempenho" marcado. 3. Exportar o PDF e abrir a seção "Métricas de Desempenho". |
| **Entrada** | Aluno com, p.ex., 24 acertos de 40 questões. |
| **Resultado Esperado** | "24 acertos de 40 questões respondidas". |
| **Resultado Encontrado** | "40 acertos de 24 questões respondidas" (valores invertidos). |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Alta |
| **Status** | Aberto |

**Detalhe técnico:** em `ReportPDF.js`, os campos `total.correct` e `total.total` foram trocados de posição na string de exibição.

---

## BUG-05 — Observações da sessão só aparecem quando NÃO existem

| Campo | Valor |
|---|---|
| **Issue** | BUG-05 |
| **Caso de Teste** | 5.1 — Consultar sessão que possui observações (HU05) |
| **Passos** | 1. Abrir o relatório de uma sessão que possua observação registrada. 2. Rolar até o fim da página. |
| **Entrada** | Sessão com observação clínica preenchida. |
| **Resultado Esperado** | Bloco "Observações da Sessão" exibe o texto registrado. |
| **Resultado Encontrado** | O bloco não é exibido quando há observação; só aparece (vazio) quando NÃO há observação. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Média |
| **Status** | Aberto |

**Detalhe técnico:** em `ReportSession/index.js`, a condição de renderização foi invertida para `!sessionData.observation`.

---

## BUG-06 — Histórico de sessões em ordem cronológica invertida

| Campo | Valor |
|---|---|
| **Issue** | BUG-06 |
| **Caso de Teste** | 2.1 — Acessando histórico de relatórios (HU02) |
| **Passos** | 1. Abrir o relatório do paciente (histórico de sessões). 2. Observar a ordem das sessões listadas. |
| **Entrada** | Aluno com várias sessões em datas diferentes. |
| **Resultado Esperado** | Sessões ordenadas da mais recente para a mais antiga. |
| **Resultado Encontrado** | Sessões ordenadas da mais antiga para a mais recente. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Média |
| **Status** | Aberto |

**Detalhe técnico:** em `ReportPacient/index.js`, a função de `sort` foi invertida (`a - b` em vez de `b - a`).

---

## BUG-07 — Pílula de porcentagem de acertos nunca fica verde

| Campo | Valor |
|---|---|
| **Issue** | BUG-07 |
| **Caso de Teste** | 2.1 — Acessando histórico de relatórios (HU02) |
| **Passos** | 1. Abrir o relatório do paciente. 2. Observar a cor do indicador "Porcentagem de acertos" em "Desempenho Geral". |
| **Entrada** | Aluno com taxa de acerto > 70% (ex.: 85%). |
| **Resultado Esperado** | Pílula em verde (`#81C784`) para desempenho acima de 70%. |
| **Resultado Encontrado** | Pílula sempre laranja (`#FFCC80`), mesmo com 85% ou 100% de acerto. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Interface |
| **Criticidade** | Baixa |
| **Status** | Aberto |

**Detalhe técnico:** o limiar de cor foi alterado de `> 70` para `> 100` (impossível de atingir).

---

## BUG-08 — Lista de documentos/relatórios não exibe os relatórios gerados

| Campo | Valor |
|---|---|
| **Issue** | BUG-08 |
| **Caso de Teste** | 7.1 — Visualizar paciente que possui documentos anexados (HU07) |
| **Passos** | 1. Abrir o perfil de um aluno que já possui relatórios gerados. 2. Acessar a aba **Documentos**. |
| **Entrada** | Aluno com 1+ relatórios pedagógicos no histórico. |
| **Resultado Esperado** | Listar os relatórios disponíveis para download. |
| **Resultado Encontrado** | Exibe "Nenhum relatório gerado ainda" mesmo havendo relatórios; quando não há, a lista fica em branco. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Média |
| **Status** | Aberto |

**Detalhe técnico:** em `patientsDetails/index.js`, a condição do estado vazio foi invertida (`length > 0` em vez de `length === 0`).

---

## BUG-09 — Respostas de Múltipla Escolha da anamnese exibidas como "—"

| Campo | Valor |
|---|---|
| **Issue** | BUG-09 |
| **Caso de Teste** | 9.1 — Visualizar paciente que possui anamneses registradas (HU09) |
| **Passos** | 1. Abrir o perfil de um aluno com anamnese respondida. 2. Acessar a aba **Anamnese**. 3. Observar perguntas do tipo Múltipla Escolha. |
| **Entrada** | Anamnese com perguntas de Múltipla Escolha respondidas. |
| **Resultado Esperado** | Exibir o texto da opção selecionada. |
| **Resultado Encontrado** | Exibe sempre "—" para perguntas de Múltipla Escolha. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Média |
| **Status** | Aberto |

**Detalhe técnico:** a busca da opção usa o campo errado (`answer.selectedOptionIds` — de Checkbox — em vez de `answer.selectedOptionId`).

---

## BUG-10 — Flag "Resposta obrigatória" não é persistida ao criar/editar modelo

| Campo | Valor |
|---|---|
| **Issue** | BUG-10 |
| **Caso de Teste** | 8.1 — Registrando uma anamnese com sucesso (HU08) |
| **Passos** | 1. Criar um modelo de anamnese. 2. Marcar "Resposta obrigatória" em uma ou mais perguntas. 3. Salvar e reabrir o modelo. |
| **Entrada** | Modelo com perguntas marcadas como obrigatórias. |
| **Resultado Esperado** | As perguntas permanecem obrigatórias após salvar. |
| **Resultado Encontrado** | Todas as perguntas são salvas como não-obrigatórias; o `required` é perdido. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Alta |
| **Status** | Aberto |

**Detalhe técnico:** em `anamneseForm/index.js`, o `buildPayload` envia `required: false` fixo em vez de `required: q.required`.

---

## BUG-11 — Validação de campos obrigatórios da anamnese invertida

| Campo | Valor |
|---|---|
| **Issue** | BUG-11 |
| **Caso de Teste** | 8.4 — Registrar anamnese com campos obrigatórios não preenchidos (HU08) |
| **Passos** | 1. Preencher uma anamnese deixando perguntas **obrigatórias** em branco. 2. Clicar em **Salvar**. |
| **Entrada** | Anamnese com campos obrigatórios vazios. |
| **Resultado Esperado** | Exibir mensagem de erro e impedir o salvamento. |
| **Resultado Encontrado** | O salvamento prossegue sem validar os campos obrigatórios; a validação recai sobre os campos opcionais. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Alta |
| **Status** | Aberto |

**Detalhe técnico:** em `anamneseResponder/index.js`, o filtro de validação foi invertido para `!q.required`.

---

## BUG-12 — Link do arquivo enviado não aparece após upload

| Campo | Valor |
|---|---|
| **Issue** | BUG-12 |
| **Caso de Teste** | 6.1 — Anexando documentos aceitos (HU06) |
| **Passos** | 1. Em uma anamnese com pergunta do tipo "Envio de Arquivo", selecionar um arquivo válido. 2. Aguardar o upload concluir. |
| **Entrada** | Arquivo válido (ex.: PDF/JPG). |
| **Resultado Esperado** | Exibir o link "Arquivo enviado — ver" e registrar a URL no campo. |
| **Resultado Encontrado** | O upload conclui, mas o link não aparece e o valor fica indefinido; campos obrigatórios de arquivo falham mesmo após o envio. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Alta |
| **Status** | Aberto |

**Detalhe técnico:** o callback usa `res.data.fileUrl` (campo inexistente) em vez de `res.data.url`.

---

## BUG-13 — Agendamento sem horário gera data inválida e trava o salvamento

| Campo | Valor |
|---|---|
| **Issue** | BUG-13 |
| **Caso de Teste** | 10.2 — Tentando agendar sessão em horário inválido (HU10) |
| **Passos** | 1. Abrir **Novo Agendamento**. 2. Selecionar aluno e data, **sem** informar o horário. 3. Clicar em **Salvar**. |
| **Entrada** | Aluno + data preenchidos, horário em branco. |
| **Resultado Esperado** | Mensagem "Informe a data e o horário." e bloqueio do salvamento. |
| **Resultado Encontrado** | A validação de horário não ocorre; a aplicação tenta montar uma data inválida (`Invalid Date`), causando erro de execução e o botão não responde. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Alta |
| **Status** | Aberto |

**Detalhe técnico:** em `agenda/index.js`, a guarda `if (!date || !time)` foi reduzida para `if (!date)`, removendo a validação de horário.

---

## BUG-14 — "Primeira Sessão" e "Última Sessão" trocadas no resumo do dia

| Campo | Valor |
|---|---|
| **Issue** | BUG-14 |
| **Caso de Teste** | 11.1 — Visualizando agenda com sessões agendadas (HU11) |
| **Passos** | 1. Abrir a **Agenda** em um dia com 2+ sessões. 2. Observar o card "Resumo do Dia". |
| **Entrada** | Dia com sessões às 09:00 e 16:00. |
| **Resultado Esperado** | Primeira Sessão = 09:00; Última Sessão = 16:00. |
| **Resultado Encontrado** | Primeira Sessão = 16:00; Última Sessão = 09:00 (invertidas). |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Interface |
| **Criticidade** | Média |
| **Status** | Aberto |

**Detalhe técnico:** `firstSession` e `lastSession` tiveram os índices trocados na lista ordenada de agendamentos.

---

## BUG-15 — Não é possível alterar a alternativa antes de confirmar

| Campo | Valor |
|---|---|
| **Issue** | BUG-15 |
| **Caso de Teste** | 13.2 — Alterando uma resposta com sucesso (HU13) |
| **Passos** | 1. Iniciar uma sessão de atividade. 2. Selecionar a alternativa A. 3. Tentar trocar para a alternativa B antes de confirmar. |
| **Entrada** | Atividade de múltipla escolha com 2+ alternativas. |
| **Resultado Esperado** | A seleção muda livremente entre alternativas até a confirmação. |
| **Resultado Encontrado** | Após a primeira seleção, não é mais possível trocar de alternativa; a primeira escolha fica travada. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Alta |
| **Status** | Aberto |

**Detalhe técnico:** `handleOptionSelect` passou a só atribuir a seleção quando ainda não há nenhuma (`if (!selectedAlternativeId)`).

---

## BUG-16 — Tempo de resposta registrado 10x maior que o real

| Campo | Valor |
|---|---|
| **Issue** | BUG-16 |
| **Caso de Teste** | 12.1 — Interagindo com uma atividade otimizada (HU12) |
| **Passos** | 1. Iniciar uma sessão. 2. Responder uma atividade após ~5 segundos. 3. Conferir o tempo registrado no relatório da sessão. |
| **Entrada** | Resposta confirmada após ~5 segundos. |
| **Resultado Esperado** | Tempo de resposta ≈ 5 segundos. |
| **Resultado Encontrado** | Tempo de resposta ≈ 50 segundos (10x maior); métricas de tempo do relatório ficam infladas. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Alta |
| **Status** | Aberto |

**Detalhe técnico:** o cálculo de `timeToAnswer` divide por `100` em vez de `1000` (ms → s).

---

## BUG-17 — Não é possível fechar a imagem ampliada clicando fora

| Campo | Valor |
|---|---|
| **Issue** | BUG-17 |
| **Caso de Teste** | 14.1 — Ampliando uma imagem com sucesso (HU14) |
| **Passos** | 1. Iniciar uma atividade com imagem. 2. Clicar na imagem para ampliar. 3. Clicar na área escura (fora da imagem) para fechar. |
| **Entrada** | Atividade com imagem. |
| **Resultado Esperado** | Clicar no overlay (fora da imagem) fecha o modal de ampliação. |
| **Resultado Encontrado** | Clicar na área externa não fecha; o modal só fecha pelo botão de voltar. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Média |
| **Status** | Aberto |

**Detalhe técnico:** o `onClick` do overlay (`lightbox-overlay`) chama `setOpen(true)` em vez de `setOpen(false)`.

---

## BUG-18 — Observação da sessão não é salva (campo enviado com nome errado)

| Campo | Valor |
|---|---|
| **Issue** | BUG-18 |
| **Caso de Teste** | 4.1 — Registrando observações com sucesso (HU04) |
| **Passos** | 1. Concluir uma sessão. 2. No modal de encerramento, escrever uma observação. 3. Clicar em **Salvar Observação**. 4. Consultar a observação depois. |
| **Entrada** | Texto de observação clínica preenchido. |
| **Resultado Esperado** | Observação salva e disponível na consulta posterior. |
| **Resultado Encontrado** | A observação não é persistida; ao consultar a sessão, ela não aparece. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Funcional |
| **Criticidade** | Alta |
| **Status** | Aberto |

**Detalhe técnico:** o corpo do POST envia `{ obs: ... }` em vez de `{ observation: ... }`, fazendo o back-end ignorar o valor.

---

## BUG-19 — Feedback de cor invertido (acerto fica vermelho, erro fica verde)

| Campo | Valor |
|---|---|
| **Issue** | BUG-19 |
| **Caso de Teste** | 12.2 — Garantindo otimização ao trocar a alternativa selecionada (HU12) |
| **Passos** | 1. Iniciar uma sessão. 2. Selecionar e **confirmar** uma alternativa correta. 3. Observar a cor de destaque da alternativa. |
| **Entrada** | Resposta correta confirmada. |
| **Resultado Esperado** | Alternativa correta destacada em verde; incorreta em vermelho. |
| **Resultado Encontrado** | Alternativa correta destacada em vermelho e incorreta em verde (cores invertidas). |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Interface |
| **Criticidade** | Média |
| **Status** | Aberto |

**Detalhe técnico:** em `OptionButtons`, a condição de classe usa `feedback === false` para aplicar `option-correct`.

---

## BUG-20 — Calendário marca dias de agendamentos cancelados

| Campo | Valor |
|---|---|
| **Issue** | BUG-20 |
| **Caso de Teste** | 11.1 — Visualizando agenda com sessões agendadas (HU11) |
| **Passos** | 1. Cancelar/excluir todos os agendamentos de um dia. 2. Observar o mini calendário da agenda. |
| **Entrada** | Dia em que todos os agendamentos foram cancelados. |
| **Resultado Esperado** | O dia não deve exibir marcador de sessão. |
| **Resultado Encontrado** | O dia continua marcado no calendário, mesmo sem sessões ativas. |
| **Data da execução** | 23/06/2026 |
| **Versão do sistema** | 0.1.0 |
| **Ambiente** | Homologação / QA — Front-End |
| **Versão** | Chrome 126.0 |
| **Sistema Operacional** | Windows 11 Pro (10.0.26200) |
| **Responsável** | Natan Lucena |
| **Tipo** | Interface |
| **Criticidade** | Baixa |
| **Status** | Aberto |

**Detalhe técnico:** `markedDates` passou a usar `appointments` (todos) em vez de `activeAppointments` (sem cancelados).

---

### Observação final
Todos os 20 defeitos estão **inseridos exclusivamente no front-end** desta branch de QA.
Nenhuma alteração foi feita em produção. Para reverter, basta descartar as mudanças desta branch.
