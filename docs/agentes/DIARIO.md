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

**Push:** não feito (aguardando pedido do usuário).

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
