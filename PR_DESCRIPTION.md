# Adiciona agenda de atendimentos e redesenha a tela inicial

## Resumo

- Cria a página `/agenda` consumindo a API de `appointment` (Bearer token): listagem por dia com navegação pelo calendário, criação (`POST`), edição de data/hora/observação (`PUT`), remarcação rápida (`PUT` só de `scheduledAt`) e exclusão com confirmação (`DELETE`); agendamentos `COMPLETED` exibem badge "Realizada" e `CANCELLED` são ocultados das listas e contagens.
- Adiciona o componente reutilizável `MiniCalendar` (pt-BR, navegação de mês, destaque de hoje/dia selecionado e ponto nos dias com agendamento), usado na agenda e na Home.
- Redesenha a Home conforme o design de `prd/agenda/nova-home.png`: banner com contagem de sessões do dia e botão "Iniciar Sessão", card de sessões de hoje, agenda do dia com link para a agenda completa, calendário com atalho de novo agendamento, "Atividades Recentes" (cadernos via `GET /task-notebook/`, com fallback para atividades via `GET /task/` quando não há cadernos) e "Últimas Sessões Realizadas" com taxa de acerto calculada das respostas.
- Corrige regra CSS global `svg { width/height: 40px }` em `forgotPassword`/`resetPassword`, escopando-a para `.lock-icon svg` — ela vazava para as demais telas e distorcia ícones; os SVGs da Home e da agenda também ganharam tamanhos explícitos como defesa.

## Plano de testes

- [ ] Logar e abrir a Home: banner, contagem de "Sessões de hoje", agenda do dia e calendário refletem os agendamentos retornados por `GET /appointment`
- [ ] Clicar em "Ver Agenda Completa" e em um dia do calendário da Home: abre `/agenda` na data correta
- [ ] Criar um agendamento pelo botão "+ Novo Agendamento" (aluno, data, hora, observação) e ver o card aparecer na data escolhida
- [ ] Editar, remarcar e excluir um agendamento `PENDING`; conferir badge "Realizada" em um `COMPLETED`
- [ ] Selecionar um dia sem agendamentos: estado vazio com botão "Criar Agendamento"
- [ ] Conferir "Resumo do Dia" (total, primeira e última sessão) para um dia com múltiplos agendamentos
- [ ] Na Home, validar "Atividades Recentes" (com e sem cadernos cadastrados) e "Últimas Sessões Realizadas" (data, duração, taxa de acerto, clique abre o relatório da sessão)
- [ ] Abrir as telas de recuperação/redefinição de senha e confirmar que o ícone de cadeado continua com 40px
