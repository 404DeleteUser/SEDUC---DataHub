# Diário de passagem de turno

Cada agente acrescenta uma entrada **no topo** ao terminar uma sessão. Assim, quem começa a próxima sessão, no outro ambiente, sabe onde o trabalho parou. Regras em `COLABORACAO.md`.

Status possíveis de uma entrada: **CONCLUÍDO** · **PENDENTE** (trabalho pela metade) · **AGUARDANDO ACORDO** (divergência que o usuário precisa decidir) · **RESOLVIDO (data, decisão)**.

Modelo:

```markdown
## AAAA-MM-DD · <local | codespace> · <branch> · <STATUS>
**Pedido do usuário:** …
**Feito:** … (commits: abc1234, …)
**Verificações:** tsc ✓ · vitest N/N ✓ · pytest N/N ✓ · e2e — (não rodado: motivo)
**Pendente / próximos passos:** …
**Divergências ou dúvidas para o outro agente / usuário:** … (ou "nenhuma")
**Push:** feito / não feito (motivo)
```

---

## 2026-10-23 · codespace · feat/entrada-supabase · AGUARDANDO ACORDO (branch do local)

**Pedido do usuário:** prompt "Tela de entrada do DataHub (login real com Supabase Auth)", trocando a parte simulada da Entrada pela autenticação real e mantendo o visual.

**Divergência:** o prompt diz que a branch `feat/tela-de-entrada` já tinha `Entrada.tsx`, `entrada.css`, `entrada.ts` e `Raiz.tsx`, mas ela **não existe no GitHub** (deve estar só no Windows). O usuário escolheu **recriar aqui pelo prompt**, na branch `feat/entrada-supabase` (nome diferente de propósito, para não sobrescrever a do local). **Agente local:** não faça push da `feat/tela-de-entrada` por cima. Compare com esta e combine com o usuário qual versão fica. Esta já tem os testes e a autenticação real.

**Outras decisões do usuário nesta sessão:**
- Contas **só por convite**: sai o "Criar conta" da F2.
- **App.tsx aprovado**: "Sair" real, a `TelaSaida` deixa de existir e o modo local continua.
- E2E com conta real lida do ambiente, **pulado se faltar**.

**Feito** (sobre a `feat/f2-login`):
- Telas e roteamento:
  - `pages/Entrada.tsx`, `pages/RedefinirSenha.tsx` (recuperação, convite e link vencido), `components/entrada/MolduraEntrada.tsx` e `styles/entrada.css`;
  - `Raiz.tsx` (sessão → Entrada, troca de senha ou App);
  - tema aplicado no `main.tsx`.
- Regras e sessão:
  - `domain/entrada.ts` (validação, mensagens e leitura do link);
  - `services/armazenamentoSessao.ts` ("Manter conectado");
  - cliente com `flowType: 'implicit'`, porque o PKCE recusa o convite do painel ("Not a valid PKCE flow url").
- Remoções: `TelaSaida`, `TelaAcesso`, `TelaNovaSenha` e `domain/acesso.ts`.
- Perfil sem "Sair" no modo local.
- `vercel.json` com CSP.
- e2e:
  - projeto `entrada` (porta 1421, Supabase fictício ou o de teste);
  - verificações comuns extraídas para `e2e/verificacoes.ts`;
  - `e2e/entrar.ts`.
- Documentação: `PUBLICAR.md` (convite, "Allow new users to sign up" desligado, Redirect URLs com `/redefinir-senha`, CSP, variáveis E2E_*), `DECISOES.md` e `DESIGN.md` (exceção de foco dos campos da Entrada).

**Verificações:** tsc ✓ · vitest 253/253 ✓ · pytest 79/79 ✓ (`engine/.venv`) · e2e 134 ✓ + 2 pulados (login real sem conta de teste) · build ✓.

**Mudança no Playwright:** o e2e local agora usa a **porta 1422**, sem reaproveitar servidor. Na 1420, ele reaproveitava o `npm run dev` aberto, que lê `.env.development.local`, abre na Entrada e travava a suíte. A CSP foi conferida servindo o `dist` com o cabeçalho: nenhum erro no console, fonte carregada.

**Pendente / próximos passos:**
- O usuário roda o SQL, desliga o cadastro aberto, ajusta as URLs e convida as pessoas.
- Criar a conta de teste e os secrets E2E_*.
- Testar o fluxo real.
- Contraste da linha de base dos campos (`--border-hover`) abaixo de 3:1 no tema claro (WCAG 1.4.11): seguido como pedido, mas vale revisar.

**Push:** não feito (aguarda pedido).

## 2026-10-23 · codespace · feat/f2-login · CONCLUÍDO (aguarda ações do usuário no Supabase)

**Pedido do usuário:** iniciar a F2 com a Project URL e a chave publishable do Supabase.

**Feito:** `@supabase/supabase-js` 2.117.3; `services/supabase.ts` e `services/conta.ts`; `domain/acesso.ts` (validação `@edu.mt.gov.br` e mensagens de erro em português); telas `TelaAcesso` (entrar, criar conta, esqueci a senha) e `TelaNovaSenha`; hook `useConta`; `App.tsx` exige conta quando o Supabase está configurado; `Perfil.tsx` com `onAlterar` assíncrono e textos "na sua conta"/"neste computador"; SQL `supabase/migrations/0001_perfis_e_acesso.sql`; `.env.example`; Playwright com `--mode e2e` (sempre modo local). Decisão em `DECISOES.md`; passo a passo em `docs/web/PUBLICAR.md`.

**Verificações:** tsc ✓ · vitest 236/236 ✓ · build ✓ (aviso de bundle > 500 kB) · e2e 100/100 ✓ (modo local) · pytest — (motor não mudou). Fluxo real contra o Supabase **não testado**: depende do SQL e da URL Configuration.

**Pendente / próximos passos:** usuário roda o SQL, ajusta Site URL/Redirect URLs e cria as variáveis na Vercel; depois testar cadastro, confirmação, login, foto e recuperação de senha de verdade. Code splitting do bundle; CSP com o domínio do Supabase (F3). Depois: F3 (Pyodide).

**Divergências ou dúvidas para o outro agente / usuário:** nenhuma. O outro agente não deve gravar a chave real em arquivo versionado (fica em `.env.development.local`, ignorado).

**Push:** não feito (aguarda pedido).

## 2026-10-23 · codespace · docs/migracao-web · EM ANDAMENTO (plano aprovado; F1 preparada)

**Pedido do usuário:** trocar o app desktop (Tauri + instalador) por um **app web na Vercel + Supabase, ambos gratuitos**. Motivo: não pagar certificado de assinatura (o instalador sem assinatura dispara aviso de vírus) e poder deixar o repositório privado depois (o que elimina o SignPath, que é gratuito só para código aberto e repositório público).

**Decisão registrada em `DECISOES.md`:** mudança de plataforma. **Fase C cancelada**: o outro agente **não deve** continuar a ponte Rust↔Python, o Python embutido nem o GitHub Actions do instalador.

**Avisos dados ao usuário (ele decidiu mesmo assim):** o plano Hobby da Vercel é "não comercial"; o Supabase grátis pausa o projeto depois de 1 semana sem uso; planilhas com dados pessoais não devem ir para o servidor (LGPD).

**Plano aprovado** (escolhas em `DECISOES.md`). **F1 preparada:** `vercel.json` (build estático, cabeçalhos de segurança) e `docs/web/PUBLICAR.md` (passo a passo das contas). **Próximo:** o usuário cria as contas e envia a Project URL e a chave anon; então F2 (login e perfil). CSP fica para a F2/F3, quando os domínios (Supabase, Pyodide) estiverem definidos.

**Push:** feito em 2026-10-23 (branches `feat/perfil`, `feat/tema-mais-dark-ascii` e `docs/migracao-web`, empilhadas nessa ordem; ainda não integradas na `main`).

## 2026-10-23 · codespace · feat/tema-mais-dark-ascii · AGUARDANDO ACORDO (C6)

**Pedido do usuário:** tema "mais dark", sidebar sem a linha do item ativo (e círculos quando recolhida), Logs sem a caixa da lista, seleção de Ferramentas sem a barra lateral, card de Logs do Início com a altura de "Ferramentas mais utilizadas", banner com "SEDUC" em ASCII animado, Perfil sem caixas e com o brasão em ASCII tremulando.

**Feito:**
- Itens 2, 3, 4, 5 e 8 (commit `e019f33`): sem caixas e sem barras laterais; contador de Logs só para leitores de tela.
- Item 1: tema escuro do Anexo A em `tokens.css`, com a tabela do `DESIGN.md` atualizada.
- Item 6: banner sem a foto e sem o lema, com "SEDUC" em ASCII (`components/ascii/AsciiSeduc.tsx`).
- Item 8: brasão em ASCII no Perfil (`AsciiBrasao.tsx`), sobre o hook comum `useAsciiCanvas.ts`.
- Item 7: a máscara usa `'IBM Plex Sans Variable'` 700 (a fonte cobre os pesos 100–700).
- Correção: o canvas media o pai com a borda e transbordava 2px. O e2e de overflow pegou o problema, e o canvas passou a usar `clientWidth`/`clientHeight`.
- `src/test/setup.ts`: `getContext` do canvas devolve `null` no jsdom (sem ruído nos testes).

**Decisões do usuário (2026-10-23):**
- C1 a · C2 a · C3 a · C4 a · C5 a · C9 a · C10 a.
- Regras atualizadas no `DESIGN.md` e registradas no `DECISOES.md`.
- C7: já estava resolvido na `feat/perfil`. C8: resolvido com `sr-only`.

**AGUARDANDO ACORDO:**
- **C6** (caracteres do ASCII abaixo de 12px) ficou sem resposta. Os ASCII usam 12px (`TAMANHO_FONTE_ASCII`), dentro da regra; com 7–8px o desenho fica mais fino, como no código de referência.
- **C3 (arquivo):** apagar `src/assets/seduc-banner.webp`, que ficou sem uso? Sem resposta; o arquivo continua no repositório.
- **Banner em 960px:** a palavra ocupa a metade direita e passa, bem apagada, por baixo do parágrafo. Isso vem do desenho de referência. Pode-se esconder o ASCII em banners estreitos, mas é decisão de design.

**Verificações:** tsc ✓ · vitest 225/225 ✓ · build ✓ · pytest 79/79 ✓ · e2e 100/100 ✓ (rodado de novo depois da correção do canvas). Capturas conferidas em claro e escuro, sidebar aberta e recolhida, 1280×800 e 960×640.

**Push:** feito em 2026-10-23 (branches `feat/perfil`, `feat/tema-mais-dark-ascii` e `docs/migracao-web`, empilhadas nessa ordem; ainda não integradas na `main`).

## 2026-10-23 · codespace · feat/perfil · CONCLUÍDO

**Pedido do usuário:** tirar "Configurações" da sidebar e transformar o Perfil numa tela (mantendo a sidebar) com foto em círculo (trocar), nome (editar), matrícula e vínculo fictícios, e-mail institucional @edu e "sair da conta".

**Feito:**
- Sidebar sem o item "Configurações"; o Perfil (rodapé) navega para a tela nova e mostra foto/iniciais e o nome, ou só "Perfil" sem nome definido (D3d mantida).
- Tela `pages/Perfil.tsx`: foto (trocar/remover; recorte central e redução para 256×256 JPEG em `utils/perfilLocal.ts`), nome com validação (`domain/perfil.ts`), dados funcionais de exemplo com selo Simulação (`mock/perfilMock.ts`, e-mail `@edu.mt.gov.br`), "Sair da conta" com confirmação em `<dialog>` e tela de saída (`components/TelaSaida.tsx`).
- Nome e foto salvos em `localStorage` (`datahub-perfil`), com leitura tolerante a dado corrompido e aviso se não der para salvar.
- Teste D3d de `decisoes-aprovadas.test.tsx` atualizado: o Perfil deixou de ser desabilitado, mas continua sem nome fictício.
- Decisões novas registradas em `DECISOES.md` (aprovadas pelo usuário nesta sessão).

**Verificações:** tsc ✓ · vitest 225/225 ✓ · pytest 79/79 ✓ · e2e 100/100 ✓ (inclui `e2e/perfil.spec.ts`, foto reduzida em canvas real, e os estados `perfil` e `tela-de-saida` no axe).

**Pendente / próximos passos:** definir a fonte real de matrícula, vínculo e e-mail (o usuário vai decidir como armazenar e puxar); login real para "Sair da conta".

**Divergências ou dúvidas para o outro agente / usuário:** nenhuma em aberto. Observação: a venv do motor no Codespace precisou de `pip install -e "engine[dev]"` de novo para ter o pandas (migração feita no ambiente local).

**Push:** feito em 2026-10-23 (`origin/feat/perfil`).

## 2026-10-23 · local · main · CONCLUÍDO

**Pedido do usuário:** ferramentas de Excel no motor (duplicidade, dicionário, dividir por…) com log em arquivo, usando o Alethe; categoria "Logs de Execução" com dados fictícios; widget do Início; remover usuário e máquina da tela; botão Cancelar execução; push para o GitHub; boas práticas de git; protocolo de colaboração entre o Claude local e o do Codespace.

**Feito:**
- **Motor:** ferramentas migradas para pandas, com parâmetros declarados, catálogo gerado em `src/generated/catalogo.json` e log legível `<saida>_log.txt` (commits `e3aaa6d`, `4b19e4a`).
- **Logs de Execução:**
  - página com filtros, lista e detalhe, mais o domínio que espelha `registro.resumo_do_arquivo` e o registro fictício no formato v1 (`7fb7cb5`, `76e3b1f`, `cbb882d`);
  - Início lendo da mesma fonte, sem usuário e máquina na tela (`e335ff5`).
- **Execução:** botão Cancelar no modal de processo e na aba Ferramentas (`8352015`).
- **Git:**
  - a história local foi religada à do GitHub, depois de um `git init` indevido, com cherry-pick dos commits por cima de `bf8f6c1`, sem force push;
  - `.gitattributes` com LF (`3db91a3`);
  - worktrees do Alethe e a branch `master` antiga removidas.

**Verificações:** tsc ✓ · vitest 211/211 ✓ · pytest 79/79 ✓ · e2e 87/87 ✓ (antes do último push).

**Pendente / próximos passos:** os itens de "Pendente de aprovação" em `DECISOES.md`. O principal é a fase C, a ponte Rust↔Python. O Codespace é o ambiente que consegue ter Rust, mas a fase C **exige aprovação do usuário** antes de começar.

**Divergências ou dúvidas para o outro agente / usuário:** nenhuma em aberto.
- **Histórico:** o `CLAUDE.md` apontava para caminhos de regras que não existiam (`.AgentsRule/...`). Foi corrigido para `AgentsRule/ask-refactoring.md`, `AgentsRule/isolation.md` e `AgentsRule/suggest-code.md`, junto com este protocolo.
- **Só no Windows local:** sobraram as pastas `.alethe/worktrees/job-12` a `job-16`, com cache de testes criado pelo sandbox dos workers, que pedem administrador para apagar. São ignoradas pelo git e não afetam o Codespace.

**Push:** `main` em `3db91a3` no GitHub. Este protocolo está na branch `chore/colaboracao-agentes` (push conforme o pedido do usuário).
