# Decisões aprovadas pelo usuário

Fonte da verdade para os dois agentes (local e Codespace). Não contrarie nada daqui sem nova aprovação explícita do usuário. Para mudar uma decisão, registre a divergência em `DIARIO.md` (veja `COLABORACAO.md`) e, depois da decisão do usuário, atualize este arquivo com a data.

## Produto e uso

- **App individual.** Cada servidor usa o DataHub no próprio computador, em ambiente isolado. Não há compartilhamento, multiusuário nem auditoria de quem rodou. *(2026-10-23)*
- **Usuário e máquina não aparecem na interface** (página e busca de Logs de Execução). O motor **continua gravando** `usuario` e `maquina` no `.jsonl`: a remoção foi "só da tela", por escolha do usuário. Não alterar o contrato de eventos por causa disso. *(2026-10-23)*
- Tudo que ainda não é real aparece como **"Simulação"** (componente `SimulationNotice`, `DESIGN.md`).
- Distribuição pelo **GitHub** (releases).

## Motor (`engine/`)

- Python + **pandas** (`pandas==2.2.3`). Cada aba é um DataFrame com `dtype=object`, para preservar int, data e `None`. As colunas são acessadas **por posição**, porque nomes podem se repetir. As ferramentas não alteram o DataFrame de entrada. *(2026-10-21/22)*
- Cada ferramenta declara seus parâmetros (`Ferramenta`/`Parametro` em `ferramentas/base.py`), e o motor valida com a mensagem de cada campo. O catálogo para o app é gerado com `python -m datahub_engine catalogo --saida ../src/generated/catalogo.json` (rodando de dentro de `engine/`). *(2026-10-22)*
- Python será **embutido no instalador** (python-build-standalone como recurso do Tauri) e chamado diretamente pelo Rust, sem `.cmd`, `.ps1` nem contorno de política de execução. *(2026-10-21)*
- **Contrato de eventos v1** (`engine/contrato/EVENTOS.md`), espelhado em `src/domain/eventosExecucao.ts`. Mudanças nele exigem aprovação e atualização dos dois lados e dos exemplos.
- **Privacidade:** eventos e logs nunca contêm valores de células. O log legível mostra só a **quantidade** de valores do Dicionário e nunca o traceback.
- **Log legível** `<saida>_log.txt` ao lado do arquivo gerado (UTF-8 com BOM, CRLF, para o Bloco de Notas), além do `.jsonl` técnico em `%APPDATA%\DataHub\logs` (retenção de 90 dias). *(2026-10-22)*
- Regras das ferramentas:
  - **Dicionário:** modo "contém" é o padrão; "exato" é opcional; sem diferenciar caixa e acento.
  - **Empilhar** (Mesclar vertical): cabeçalho estrito, ignorando só os espaços nas pontas.
  - **Duplicatas:** chave exata e sensível ao tipo; fica uma linha sorteada por grupo.

## App (front)

- Parâmetros ficam salvos na etapa do processo; o uso avulso (aba Ferramentas) não salva.
- **Cancelar execução** é direto, sem confirmação: o botão aparece só durante a execução (modal de processo e aba Ferramentas). Nenhuma saída é gravada. *(2026-10-23)*
- **Logs de Execução:** por enquanto é Simulação. Lê `src/mock/logsExecucaoMock.ts`, no formato dos eventos v1. O widget do Início usa a mesma fonte. *(2026-10-22/23)*

- **Sidebar sem "Configurações"**: as opções do usuário ficam centralizadas na tela de **Perfil** (clique no perfil, no rodapé da sidebar). *(2026-10-23)*
- **Perfil:** nome e foto ficam salvos **no computador** (`localStorage`, app individual). Matrícula, vínculo e e-mail institucional são **fictícios** com o selo Simulação, até o usuário definir a fonte. Sem nome definido, a sidebar mostra só "Perfil" (respeita a D3d: nada de perfil fictício como real). *(2026-10-23)*
- **"Sair da conta"** é uma Simulação: pede confirmação e mostra a tela "Você saiu do DataHub" com "Entrar novamente", porque ainda não há login. *(2026-10-23)*

## Git e ambientes

- Remoto `origin` = `github.com/404DeleteUser/SEDUC---DataHub` (**público**), branch principal `main`. *(2026-10-23)*
- Uma branch por tarefa; push só quando o usuário pedir; nunca force push sem pedido explícito.
- Fim de linha LF em todos os ambientes (`.gitattributes`). *(2026-10-23)*
- `graphify-out/` continua versionado, como o usuário já fazia no GitHub. *(2026-10-23)*

## Pendente de aprovação (não implementar sem o "sim" do usuário)

- A UI montar os formulários a partir do `catalogo.json`. Hoje ela usa `src/mock/ferramentasMock.ts` e `FormularioFerramenta.tsx`.
- **Fase C:** ponte Rust↔Python, build com Python embutido, GitHub Actions para gerar o instalador.
- `.devcontainer` para o Codespace já subir com Node, Python 3.12, as dependências e o Chromium (oferecido em 2026-10-23, sem resposta).
- Bug B4 de `docs/ux-ui-modernization-plan.md`: as opções de log não são salvas no processo.
