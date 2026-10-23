# Colaboração entre os agentes: local e Codespace

O usuário trabalha neste projeto em **dois ambientes, alternando entre eles**, cada um com seu próprio Claude:

| | **Local** | **Codespace** |
|---|---|---|
| Onde | Windows 11, `C:\Users\Augusto\Downloads\SEDUC-DataHub` | GitHub Codespaces (Linux), clone do mesmo repositório |
| Memória do Claude | Tem memória própria (fora do repositório) | Não tem a memória do local |
| Ferramentas extras | Alethe (workers em worktrees), Playwright com Chromium | Pode instalar Rust/cargo (o local não tem) |
| Venv do motor | `engine\.venv\Scripts\python.exe` | `engine/.venv/bin/python` |
| Shell | PowerShell 5.1 e Git Bash | bash |

Os dois agentes **não se falam diretamente**. Tudo o que um precisa saber do outro passa pelo git, nestes arquivos:

- **`docs/agentes/DECISOES.md`**: decisões já aprovadas pelo usuário. É a fonte da verdade e não se contraria sem nova aprovação.
- **`docs/agentes/DIARIO.md`**: passagem de turno. Registra o que foi feito, onde parou, o que está pendente e as divergências em aberto.
- **`CLAUDE.md` e `AgentsRule/`**: regras de engenharia obrigatórias para os dois.

Se algo não está nesses arquivos, para o outro agente **não existe**. Na dúvida, registre.

## Início de toda sessão (obrigatório)

1. `git fetch && git status -sb`. Se a branch estiver atrás, `git pull --ff-only`. Se tiver divergido, **pare e avise o usuário** (não faça merge nem rebase por conta própria em `main`).
2. Leia `docs/agentes/DECISOES.md` e as **últimas entradas** de `docs/agentes/DIARIO.md`, principalmente as marcadas **AGUARDANDO ACORDO** ou **PENDENTE**.
3. Compare o que encontrou com o que o usuário pede agora (veja "Divergências" abaixo).
4. Prepare o ambiente se faltar algo; isso não vai pelo git:
   - Front: `npm ci`
   - Motor: `python3 -m venv engine/.venv && engine/.venv/bin/pip install -e "engine[dev]"` (no Windows, `engine\.venv\Scripts\`)
   - E2E: `npx playwright install --with-deps chromium`

## Durante a sessão

- **Uma branch por tarefa** (`feat/…`, `fix/…`, `chore/…`, `docs/…`), criada a partir da `main` atualizada. Nada de commit direto em `main`.
- Siga `CLAUDE.md` e **todas** as regras de `AgentsRule/` (pedir antes de refatorar fora do escopo, isolar domínios, sugerir abordagem e esperar aprovação quando mudar design, arquitetura ou regra de negócio).
- **Não desfaça nem reescreva o trabalho do outro agente** sem o usuário aprovar. Se achar um problema no que o outro fez, registre no diário e avise o usuário (veja "Divergências").
- Fim de linha é LF (`.gitattributes`). Não introduza CRLF nem BOM.
- **Nunca** versione `node_modules/`, `engine/.venv/`, `.alethe/`, dados reais (`dados-sensiveis/`), segredos ou planilhas de pessoas. O repositório é **público**.

## Fim de toda sessão (obrigatório)

1. Rode as verificações que se aplicam e anote o resultado real (não declare que passou sem rodar):
   - `npx tsc --noEmit -p .`
   - `npx vitest run`
   - `engine/.venv/bin/python -m pytest -q` (dentro de `engine/`)
   - `npx playwright test` (se mexeu em tela)
2. Acrescente uma entrada no **topo** de `docs/agentes/DIARIO.md` (modelo no próprio arquivo).
3. Se uma decisão nova foi aprovada pelo usuário, registre-a em `docs/agentes/DECISOES.md`, com a data e quem confirmou.
4. Commit na branch da tarefa. **Push só quando o usuário pedir.** Se ele for trocar de ambiente, lembre-o de pedir o push; sem push, o outro lado não vê nada.
5. Nunca `git push --force` nem reescrita de histórico em `main` sem pedido explícito.

## Divergências: avisar o usuário e chegar a um acordo

Pare e **avise o usuário antes de agir** quando:

- o pedido atual contraria algo em `DECISOES.md`;
- o pedido contraria uma regra de `AgentsRule/` ou de `CLAUDE.md` (refatoração fora do escopo, quebra de isolamento entre domínios, mudança de design, arquitetura ou contrato);
- o outro agente fez algo diferente do que o usuário pediu, deixou algo inconsistente ou quebrou testes;
- a branch local e a remota divergiram, ou há trabalho do outro agente não integrado que conflita com a tarefa.

Como registrar e resolver:

1. Explique ao usuário em poucas linhas: o que diverge, onde (arquivo ou commit), as opções e a sua recomendação.
2. Registre no diário uma entrada **AGUARDANDO ACORDO** com a mesma explicação e a sua proposta.
3. O outro agente, ao começar a sessão, lê a entrada e responde **na mesma entrada**: concorda ou faz outra proposta, com o motivo.
4. **Quem decide é o usuário.** Depois da decisão, marque a entrada como **RESOLVIDO (data, decisão)** e, se for duradoura, copie para `DECISOES.md`.
5. Enquanto não houver acordo, não implemente a parte em disputa. Siga com o que não depende dela.

## Limites de cada ambiente

**Codespace (Linux):**
- Pode instalar Rust e trabalhar na ponte Rust↔Python (fase C) **somente com aprovação do usuário**; ela é arquitetural.
- O instalador do Windows não sai daqui. Builds para Windows serão feitos por GitHub Actions ou no ambiente local.
- Não tem Alethe nem a memória do local. Confie nos arquivos de `docs/agentes/`.
- Caminhos de exemplo no código (`C:\Users\...`) são **dados fictícios** do mock, não do ambiente.

**Local (Windows):**
- Não compila Tauri/Rust (sem cargo instalado).
- O PowerShell 5.1 corrompe patches com `>` (UTF-16); use Git Bash para `git diff`.
- Ao usar workers do Alethe: revisar todo o código que voltar antes de integrar, normalizar para LF sem BOM e limpar as worktrees depois. Antes de `git worktree remove`, remova a junção `node_modules` com `cmd /c rmdir`.
