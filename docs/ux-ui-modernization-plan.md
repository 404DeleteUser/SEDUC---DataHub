# Plano de modernização de UX/UI — DataHub SEDUC-MT

- **Data da auditoria:** 21/10/2026
- **Escopo auditado:** todo o frontend em `src/` (commit `27a9611`, sem alterações locais em `src/`)
- **Status:** Fases 1 a 3 concluídas. **Fase 4 aprovada em 21/10/2026** (decisões na §11).

---

## 0. Como a auditoria foi feita (evidências e limitações)

| Verificação | Ferramenta | Resultado |
|---|---|---|
| Leitura integral do código | leitura manual de todos os arquivos de `src/` (≈5.000 linhas) | concluída |
| Typecheck | `npx tsc --noEmit` | **0 erros** |
| Build | `npm run build` | **ok**: JS 354 kB (107 kB gzip), CSS 43,8 kB, `xlsx` em chunk separado |
| Aplicação real | `npm run dev` + Chromium headless (Playwright 1.64.1, instalado **fora** do projeto) | 50 capturas: 10 estados × 2–3 viewports × 2 temas |
| Acessibilidade automática | axe-core 4.11 em cada estado (light e dark, 1280×800 e 800×600) | 2 tipos de violação, ambos `serious` |
| Teclado | 22 `Tab` na Home, medindo o `outline` do elemento focado | ordem lógica; foco visível em todos os elementos |
| Overflow e fontes | script no navegador: `scrollWidth > clientWidth` e `font-size` computado de cada nó de texto | ver §3 |

**Viewports usados:** 800×600 (tamanho padrão da janela em `src-tauri/tauri.conf.json`), 1280×800 e 1920×1080.

**Limitações (não invento resultados além destas):**
1. As capturas foram feitas no Linux. A fonte do projeto (`Segoe UI Variable`) só existe no Windows, então as imagens usam a fonte de fallback. Métricas e quebras de linha no app real (WebView2/Windows) podem diferir um pouco.
2. Não testei o app empacotado com Tauri, porque o Rust não está instalado neste ambiente. Nada no frontend depende de APIs Tauri hoje, então o comportamento no navegador é representativo.
3. Não há testes automatizados no repositório: nem Vitest/Jest, nem Playwright no `package.json`, nem arquivos `*.test.*`. Também não há linter (ESLint) configurado.
4. As capturas e o `report.json` ficaram no scratchpad da sessão e **não estão versionadas**. Se você aprovar o lote L0, o script de captura vira um teste visual dentro do repositório.

---

## 1. Fontes de regras lidas e conflitos encontrados

Lidos: `CLAUDE.md`, `projeto.md` (o AGENTS.md do projeto), `AgentsRule/ask-refactoring.md`, `AgentsRule/isolation.md`, `AgentsRule/suggest-code.md` e `.claude/rules/ecc/{common,typescript,react,web}`.

| # | Conflito | Proposta de resolução |
|---|---|---|
| C1 | A missão pede "modernização integral", mas o `projeto.md` §14 e §17 manda "não redesenhar a tela inteira", "preservar layout/dimensões aprovados" e "não mudar identidade SEDUC-MT". | **Modernização evolutiva**: fundação (tokens, tipografia, componentes) + correções de UX, mantendo a estrutura das telas e a identidade. Mudanças de layout ficam listadas por tela e **só entram com aprovação explícita (D1)**. |
| C2 | `.claude/rules/ecc/web/design-quality.md` (ECC) proíbe "sidebar + cards", "default font stacks" e pede direções como editorial ou neo-brutalismo. Isso contradiz o `projeto.md` §14 (interface compacta, preservar). | Prevalecem as regras do projeto (`CLAUDE.md`/`projeto.md`). O ECC serve apenas como checklist de qualidade (hierarquia, estados, semântica de cor). |
| C3 | A regra ECC `common/testing.md` exige TDD e 80% de cobertura, mas o repositório não tem nenhuma infraestrutura de teste. | Adicionar Vitest, Testing Library e Playwright como devDependencies. São dependências novas, então pedem aprovação (D2). Sem elas, o TDD fica inviável e eu reporto isso como limitação. |
| C4 | O `CLAUDE.md` cita `.AgentsRule/domain-isolation.md` e `.AgentsRule/suggest-best-approach.md`, que não existem. Os arquivos reais são `AgentsRule/isolation.md` e `AgentsRule/suggest-code.md`. | Usei os arquivos reais. Corrigir o `CLAUDE.md` está fora deste escopo e fica pendente para você. |
| C5 | O `projeto.md` §3 e §15 está desatualizado. A estrutura real tem `PageHeader`, `FolderPicker`, `ProcessCardAction` e `configuracaoProcessosMock`, e o Prettier real usa `singleQuote: true`. | O código é a fonte de verdade (§19). Proponho atualizar o `projeto.md` no lote L8. |

---

## 2. Inventário

### 2.1 Navegação
Não há router: a navegação é feita por estado em `App.tsx` (`paginaAtual`). A sidebar mantém **Processos** ativo nas três telas do fluxo.

| "Rota" | Arquivo | Linhas | Tipo |
|---|---|---|---|
| `inicio` | `src/pages/Home.tsx` | 227 | dashboard (banner, destaques, ferramentas, logs) |
| `processos` | `src/pages/Processos.tsx` | 184 | catálogo com busca, cards e estado vazio |
| `novo-processo` | `src/pages/NovoProcesso.tsx` | 1303 | formulário, etapa 1/2 (também usado na edição) |
| `configurar-processo` | `src/pages/ConfigurarProcesso.tsx` | 1272 | formulário, etapa 2/2: fluxo com arrastar e soltar, colunas, condição, logs |
| (diálogo) | `src/components/ExecuteProcessModal.tsx` | 355 | `<dialog>` nativo de execução **simulada** |

Itens da sidebar **sem tela** (desabilitados): Ferramentas, Logs de Execução, Sites Institucionais, Coordenadorias e Equipes, Configurações e Perfil.

### 2.2 Componentes
| Componente | Onde é usado | Observação |
|---|---|---|
| `Sidebar` (`components/sidebar.tsx`) | App | arquivo em minúscula, fora do padrão PascalCase |
| `ThemeToggle` | App | `position: fixed` sobre o header |
| `PageHeader` + `ProcessSteps` | 4 páginas | ok |
| `ProcessCardAction` | Home, Processos | botão invisível que cobre o card inteiro |
| `FolderPicker` | NovoProcesso | seleção de pasta só como prévia no navegador |
| `ExecuteProcessModal` + `CampoArquivo` | Home, Processos | — |
| `TituloSecao`, `Label` | **duplicados** em NovoProcesso e ConfigurarProcesso | candidatos a componente compartilhado |
| `EtapaOrdenavel`, `FerramentaCabecalho`, `LogCheckbox` | ConfigurarProcesso | locais |

### 2.3 Formulários, tabelas, dashboards e diálogos
- **Formulários:** NovoProcesso (nome, descrição, ícone/cor/imagem, 2 principais, modo, até 3 auxiliares, saída, origem Python), ConfigurarProcesso (etapas, planilhas, colunas, condição, logs) e o modal (3 caminhos).
- **Tabelas:** nenhuma.
- **Dashboards:** Home.
- **Diálogos:** 1 (`ExecuteProcessModal`).

### 2.4 Tokens existentes (`src/index.css`)
Já existem 27 variáveis de cor para light e dark (`--bg-*`, `--text-*`, `--accent*`, `--success/warning/danger`, `--banner-*`, `--window-*`, sombras e scrim). **Faltam:** escala tipográfica, espaçamento, raio, elevação, duração/easing, foco, e as variantes "soft" de status (`--danger-soft` e similares).

### 2.5 O que já está bom e deve ser preservado
Skip link; `:focus-visible` global com outline de 2px; `aria-current`/`aria-pressed`/`aria-invalid`/`role=status|alert|log`; `<dialog>` nativo com `showModal()`, que já prende o foco; `prefers-reduced-motion`; `tabular-nums` em números; light e dark ambos intencionais; nenhum erro de console em nenhum estado; leitura de colunas com estado de carregamento e de erro.

---

## 3. Diagnóstico priorizado

Impacto: **A** (alto), **M** (médio), **B** (baixo). Esforço: **P** (pequeno), **M** (médio), **G** (grande).

### 3.1 Prioridade alta

| ID | Problema | Evidência | Impacto para o usuário | Imp. | Esf. |
|---|---|---|---|---|---|
| A1 | **Tipografia pequena demais e sem escala.** São 15 tamanhos distintos; 41 regras usam de 8 a 11px. | `index.css`: `.welcome-motto` 8px; `.sidebar-brand p`/`.eyebrow`/`.activity-item time` 9px; 17 regras com 10px; 18 com 11px. Medição: **55 a 87 nós de texto com menos de 12px por tela** (modal concluído: 87). | Leitura cansativa num app de uso diário; metadados (duração, horário, status) quase ilegíveis. | A | M |
| A2 | **O layout não se adapta à janela padrão do Tauri (800×600).** | Capturas `*__tauri__*`: a sidebar ocupa 224px (28% da largura); em `novo-processo` sobram cerca de 290px de altura úteis entre header, stepper e rodapé; a Home cai para uma coluna com cards largos e vazios. | A primeira impressão no app desktop é de uma tela apertada, com muita rolagem. | A | M |
| A3 | **O texto da marca é cortado na sidebar** em todas as telas. | Overflow medido em todos os 50 estados: `aside.app-sidebar` (238 > 223). Na captura aparece "SEDUC · I". | Identidade institucional truncada e acabamento descuidado. | A | P |
| A4 | **Quatro nomes diferentes para "não é real"**, e um deles é jargão técnico. | "Demonstração" (Home, NovoProcesso, ConfigurarProcesso), **"Mock"** (`Processos.tsx:100`), "Simulação" (modal), "Prévia simulada" (`NovoProcesso.tsx:502`), "Histórico demonstrativo" (Home). | O usuário não sabe o que funciona de fato. "Mock" é termo de desenvolvedor. | A | P |
| A5 | **Contraste insuficiente de `--text-muted` (light).** | axe `color-contrast` (serious), 10 ocorrências: `.catalog-count` e `.demo-badge` 4,39:1 (#64748b sobre #f4f6f9); `.eyebrow` 4,26:1 (sobre #eef3f8); descrição da etapa selecionada 4,16:1 (sobre #eaf0fc). | Abaixo do mínimo WCAG AA de 4,5:1. | A | P |
| A6 | **A lista de etapas do fluxo tem texto centralizado**, diferente do resto da interface. | `ConfigurarProcesso.tsx:1091-1125`: o `<button>` herda `text-align: center` do navegador. Visível em `configurar-processo__desktop__light.png`. | O fluxo, que é a parte central da configuração, parece desalinhado e difícil de varrer. | A | P |
| A7 | **O painel "1. Origem do Processo" fica quase vazio** e ocupa cerca de 40% da largura ao lado do fluxo. | `ConfigurarProcesso.tsx:442-460` + `.config-top-grid` (0.85fr/1.15fr, `min-height: 280px`). Na captura, cerca de 470px de área vazia. | Desperdiça espaço justamente onde o usuário trabalha (fluxo e etapas). | A | P |

### 3.2 Prioridade média

| ID | Problema | Evidência | Impacto | Imp. | Esf. |
|---|---|---|---|---|---|
| M1 | **Clicar no card executa uma ação inesperada.** O card inteiro é um botão "Editar", e há também um lápis "Editar" e um "Executar". | `ProcessCardAction.tsx`, usado em `Home.tsx:105` e `Processos.tsx:112`; lápis em `Processos.tsx:122`. Na ordem de tabulação, "Editar X" aparece duas vezes por card em Processos. | Um clique para "ver" abre a edição; há ação redundante para teclado e leitor de tela. | M | P* |
| M2 | **"Executar" já inicia a simulação ao abrir o modal**, com caminhos fictícios pré-preenchidos (`C:\Dados\Orgao_Referencia.xlsx`). | `Home.tsx:118` e `Processos.tsx:154` passam `executar=true`; `ExecuteProcessModal.tsx:31-35,104`. | Não há chance de revisar as entradas. Com executor real, isso vira risco de executar com arquivos errados (prevenção de erros, `projeto.md` §1). | M | P* |
| M3 | **Componentes duplicados e variantes concorrentes.** | `Label` e `TituloSecao` duplicados (`NovoProcesso.tsx:1260,1282` e `ConfigurarProcesso.tsx:1200,1221`); bloco de erro de campo repetido 4×; botões: `.primary-button`, `.secondary-button`, `.botao-secundario`, `.text-button`, `.icon-button`, `.process-execute` e botões com Tailwind inline; selects: `.campo-processo` e `h-9 … bg-[var(--bg-card-secondary)]` (`ConfigurarProcesso.tsx:528`). | Aparência inconsistente e manutenção cara. | M | M |
| M4 | **Cores fixas fora dos tokens.** | `text-red-500` (asterisco, `NovoProcesso.tsx:1298`); `hover:bg-red-500/10 hover:text-red-500` (`NovoProcesso.tsx:1044`) e `hover:text-red-400` (`ConfigurarProcesso.tsx:1154`); `bg-blue-600` no checkbox de planilha (`ConfigurarProcesso.tsx:635`), onde o `Check` herda `--text-primary`, ou seja, ícone escuro sobre azul no tema light. | Viola o `projeto.md` §8; o estado destrutivo e o selecionado variam de tom entre as telas. | M | P |
| M5 | **CSS global grande e contraditório.** | `index.css` tem 1.492 linhas (o limite das regras é 800); 9 seletores redefinidos (`.process-card`, `.secondary-button`, `.search-field:focus-within`…); `@media (max-width:1000px)` declarado 2× com valores opostos para `.page-header-action` (`padding-right: 0` e depois `42px`); 3 classes sem uso (`form-footer-note`, `modal-backdrop`, `muted-count`). | Alto risco de regressão a cada ajuste; ordem da cascata frágil. | M | M |
| M6 | **O `ThemeToggle` fica fixo por cima do header.** | `ThemeToggle.tsx:26-44` (`fixed top-4 right-4`). Compensado com o hack `.page-header-action { padding-right: 42px }`. | Pode sobrepor ações do header em larguras intermediárias; o botão fica fora do fluxo do documento. | M | P |
| M7 | **A numeração das seções é inconsistente.** | NovoProcesso: "Origem do processo" sem número antes de "1. Informações Gerais"; ConfigurarProcesso repete "1. Origem do Processo" só para leitura. | A sequência perde o sentido e a origem aparece duas vezes. | M | P |
| M8 | **Erros de formulário sem resumo e sem legenda do asterisco.** | `NovoProcesso.tsx:262-316`: o foco vai ao primeiro erro, mas erros fora da dobra, como "Pasta de destino", ficam invisíveis; não existe "* campo obrigatório"; `aria-label` repete o `<label>` visível (`:565`, `:593`, `:1120`). | O usuário só descobre o 2º, 3º ou 4º erro rolando a tela. | M | P |
| M9 | **Na sidebar recolhida, os itens desabilitados parecem iguais aos ativos.** | `sidebar-recolhida__*`: o "—" some quando recolhida e os rótulos de grupo viram "···". | O usuário clica em ícones que não fazem nada. | M | P |
| M10 | **A região de log não recebe foco por teclado.** | axe `scrollable-region-focusable` (serious): `.log-output` (`ExecuteProcessModal.tsx:272`). | Quem usa teclado não consegue rolar o log. | M | P |
| M11 | **O banner pesa 2,29 MB.** | Saída do build: `seduc-banner-*.png 2,289.31 kB`, exibido com até 62% da largura e opacidade de 0,48. | Aumenta o instalador e o tempo da primeira pintura. | M | P |

\* Muda um comportamento observável e exige sua decisão (ver §9).

### 3.3 Prioridade baixa

| ID | Problema | Evidência |
|---|---|---|
| B1 | Perfil fixo no código ("Davi Silva / Analista de Dados"), apresentado como se fosse real | `sidebar.tsx:122-123`; vai contra o `projeto.md` §0.6 |
| B2 | IDs gerados por slug com acentos removidos: `descri-o`, `nome-do-arquivo-de-sa-da` | `NovoProcesso.tsx:590,1108` (são usados por `getElementById` no foco de erro, então mudá-los é risco de regressão) |
| B3 | Arquivo vazio `src/mock/novoProcessoMock.ts` | 0 linhas |
| B4 | As opções de log (`mostrarLinhas`, `indicadorPrincipal`…) **não são salvas** no processo | `ConfigurarProcesso.tsx:84-88,393-398`. **É um bug funcional fora do escopo de UI**; só o registro aqui |
| B5 | A fonte só existe no Windows; não há fonte monoespaçada definida para caminhos e logs (`ui-monospace, Consolas`) | `index.css:72,1246` |

### 3.4 Padrões de "AI slop" identificados

| Padrão | Onde | Proposta |
|---|---|---|
| Slogan de efeito sem informação: "INTERFACE QUE ORGANIZA / PROCESSOS QUE TRANSFORMAM" (8px, espaçado, em caixa alta) | `Home.tsx:82-86` | Remover, ou trocar por informação útil (D3) |
| Texto de marketing genérico no banner ("Centralize processos, automatize rotinas…") | `Home.tsx:72-75` | Trocar por orientação prática ("Comece por um processo em destaque ou crie um novo") (D3) |
| Três barrinhas decorativas coloridas | `.institutional-line` | Manter só se representarem as cores de MT de forma intencional, com o banner (D3) |
| Eyebrow em caixa alta minúscula e muito espaçada ("SEDUC · MATO GROSSO", 9px) | `.eyebrow` | Escala mínima de 12px e uso parcimonioso |
| Grade de cards uniforme: todos com o mesmo quadrado colorido, mesma anatomia e mesmo peso | Home e Processos | Hierarquia: título e ação primária em destaque; categoria e metadados recuados; densidade ajustada |
| Rótulo de status inventado como "Demonstração · Mock · Simulação" em cada canto | ver A4 | Um único componente de aviso de simulação, com um único termo |
| Persona fictícia no perfil | B1 | "Perfil em preparação", sem nome |
| Seção numerada + ícone + título + linha divisória em todo painel | NovoProcesso e Configurar | Número apenas quando for passo sequencial real |

---

## 4. Direção visual proposta

**"Institucional operacional"**: uma ferramenta de trabalho da administração pública, precisa e calma. A direção nasce do próprio produto (planilhas, etapas, logs), não de uma tendência.

- **Por quê:** o DataHub é usado repetidamente por analistas, em janela desktop, para tarefas de risco (cruzar folha e vigência). O que pesa aqui é legibilidade, previsibilidade e prevenção de erro, não impacto visual. Isso respeita o `projeto.md` §1 ("baixa carga cognitiva, consistência, feedback, prevenção de erros") e §14 ("compacta, cards arredondados, Lucide, ícones coloridos, azul primário, navy no dark, cinza claro no light").
- **Mantém:** a paleta e os tokens existentes (corrigindo só o contraste), a estrutura sidebar + header + conteúdo, os ícones Lucide coloridos por entidade, o banner institucional (com o texto revisado, se D3 for aprovada) e os dois temas.
- **Muda:**
  1. **Escala tipográfica** de 6 passos, com mínimo de 12px: 12 / 13 / 14 (base) / 16 / 20 / 26.
  2. **Espaçamento em base 4** com ritmo intencional: grupos internos apertados (8px), separação entre seções mais folgada (24px).
  3. **Raio** em 3 níveis (6 / 10 / 14) em vez dos 9 valores atuais.
  4. **Elevação** em 2 níveis (superfície e diálogo).
  5. **Estados** com uma linguagem única: selecionado com borda de acento e fundo suave; destrutivo com `--danger` e `--danger-soft`; desabilitado com opacidade e `cursor` próprios.
  6. **Fonte monoespaçada** para caminhos, logs e nomes de coluna (`'Cascadia Mono', Consolas, ui-monospace`), todas nativas do Windows.
- **Tipografia:** continua com a pilha de fontes nativas do Windows (`Segoe UI Variable`), de forma **deliberada**: é um app desktop Windows, a fonte do sistema garante nitidez e não exige download nem dependência nova. Uma fonte própria, como IBM Plex Sans, fica como opção para a D5, não como padrão.
- **21st.dev:** na Fase 4, antes de criar componentes como `OptionCard`, `FileDrop`, `Stepper` e `StatusBadge`, consulto o catálogo pelo MCP e uso como **referência de anatomia e estados**. Não instalo shadcn nem componentes de terceiros sem a sua aprovação, porque o projeto não usa shadcn e não tem `components.json`.

---

## 5. Design system e tokens a padronizar

```css
/* Novos tokens (os valores finais são validados por contraste no lote L1) */
--font-sans: 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif;
--font-mono: 'Cascadia Mono', Consolas, ui-monospace, monospace;
--text-xs: 12px;  --text-sm: 13px;  --text-md: 14px;
--text-lg: 16px;  --text-xl: 20px;  --text-2xl: 26px;
--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-6: 24px; --space-8: 32px;
--radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px;
--shadow-surface: (= --surface-shadow atual);  --shadow-dialog: (= --modal-shadow atual);
--duration-fast: 120ms; --duration-base: 180ms; --ease-out: cubic-bezier(.2,.8,.2,1);
--danger-soft / --success-soft / --warning-soft (color-mix sobre --bg-card);
--focus-ring: 2px solid var(--accent);
/* Correção de contraste: --text-muted (light) passa de #64748b para um valor ≥ 4,5:1
   sobre --bg-app, --accent-soft e --banner-bg (alvo: #5a6a80 ou mais escuro). */
```

Organização proposta (depende da D4): `src/styles/tokens.css`, `base.css`, `components.css` e `layout.css`, todos importados por `src/index.css`, que continua sendo o ponto de entrada global, como pede o `projeto.md` §9.

---

## 6. Componentes compartilhados a criar ou evoluir

| Componente | Substitui | Consumidores |
|---|---|---|
| `ui/Button` (variantes `primary`, `secondary`, `ghost`, `danger`, `icon`) | `.primary-button`, `.secondary-button`, `.botao-secundario`, `.text-button`, `.icon-button` e os botões inline | todas as telas |
| `ui/Field` (label, controle, dica, erro, obrigatório) | os 2 `Label` + 4 blocos de erro | NovoProcesso, ConfigurarProcesso, modal |
| `ui/SectionTitle` | os 2 `TituloSecao` | NovoProcesso, ConfigurarProcesso |
| `ui/OptionCard` (radio visual, `aria-pressed`) | `.opcao-modo` + classes inline duplicadas | NovoProcesso (origem e modo) |
| `ui/FileField` | `.seletor-arquivo` repetido 4× | NovoProcesso, modal |
| `ui/SimulationNotice` (termo único) | `.demo-badge` com 4 textos diferentes | todas as telas |
| `ui/StatusText` | `.status-text` + ternário inline | Home (logs) e futuras telas de Logs |
| `ui/Checkbox` e `ui/SelectableChip` | checkbox `bg-blue-600`, botões de coluna, `LogCheckbox` | ConfigurarProcesso |
| `Sidebar` (evolução) | — | marca sem corte, estado desabilitado claro quando recolhida, recolhimento automático abaixo de 1100px (D1) |
| `PageHeader` (evolução) | `ThemeToggle` fixo | o toggle passa a ser um slot do header |

---

## 7. Lotes de implementação

Cada lote termina com a validação da §8. A propriedade de arquivos garante que dois agentes nunca editem o mesmo arquivo ao mesmo tempo.

| Lote | Conteúdo | Arquivos (dono exclusivo) | Depende de | Paralelo com |
|---|---|---|---|---|
| **L0** | Infraestrutura de testes: Vitest + Testing Library + jsdom; Playwright com testes visuais e axe; scripts `test` e `test:e2e` | `package.json`, `vitest.config.ts`, `playwright.config.ts`, `tests/**` | **D2** | — |
| **L1** | Fundação: tokens, escala tipográfica, contraste, limpeza de duplicatas e classes mortas no CSS, divisão de `index.css` | `src/index.css`, `src/styles/**` | L0, D4 | — |
| **L2** | Componentes `ui/*` (§6) com testes unitários | `src/components/ui/**` | L1 | — |
| **L3** | Shell: Sidebar, PageHeader + ThemeToggle | `sidebar.tsx`, `PageHeader.tsx`, `ThemeToggle.tsx`, `App.tsx` (apenas onde o toggle é montado) | L2 | L4, L5, L6, L7 |
| **L4** | Home + Processos: hierarquia dos cards, interação do card (D3), aviso de simulação único, texto do banner (D3), banner em WebP (D6) | `Home.tsx`, `Processos.tsx`, `ProcessCardAction.tsx`, `src/assets/seduc-banner.*` | L2 | L3, L5, L6, L7 |
| **L5** | Novo Processo: ordem e numeração das seções, `Field`, `OptionCard`, `FileField`, resumo de erros, densidade em 800×600 | `NovoProcesso.tsx`, `FolderPicker.tsx` | L2 | L3, L4, L6, L7 |
| **L6** | Configurar Processo: alinhamento do fluxo, layout Origem + Fluxo, checkbox/chips com tokens | `ConfigurarProcesso.tsx` | L2 | L3, L4, L5, L7 |
| **L7** | Modal de execução: início da execução (D3), log focável, campos com `FileField`, fonte mono | `ExecuteProcessModal.tsx` | L2 | L3–L6 |
| **L8** | Regressão completa (todos os estados × temas × viewports), revisão independente, atualização do `projeto.md` (§3, §15) | `projeto.md`, `docs/**` | L3–L7 | — |

**Ordem:** L0 → L1 → L2 → {L3, L4, L5, L6, L7} → L8. Os lotes entre chaves podem rodar em paralelo, cada um com um agente dono dos seus arquivos.

**Fora do escopo** (não entram sem pedido): telas novas (Ferramentas, Logs, Configurações), persistência, executor Python, React Router, troca de stack e o bug B4.

---

## 8. Critérios de aceitação e estratégia de testes

### 8.1 Critérios de aceitação (todos os lotes)
1. `npx tsc --noEmit` sem erros e `npm run build` concluído.
2. Testes unitários do lote passando. Se aplicável, testes escritos antes da mudança (TDD) e cobertura de ≥ 80% nos componentes `ui/*` novos.
3. **axe-core: zero violações `serious` ou `critical`** em todos os estados capturados, nos dois temas, em 1280×800 e 800×600.
4. **Nenhum texto renderizado abaixo de 12px** (medido pelo mesmo script).
5. **Nenhum overflow horizontal** em 800×600, 1280×800 e 1920×1080.
6. Ordem de tabulação preservada ou melhorada, com foco visível em 100% dos elementos.
7. Light e dark revisados por captura antes/depois em cada tela alterada.
8. **Checklist de preservação funcional:** todos os botões e funções atuais continuam disponíveis (navegação, busca, editar, executar, criar, validações obrigatórias, limite de 3 auxiliares, reordenação por arrasto e por botões, seleção de planilhas e colunas, condição, tema persistido, sidebar recolhível).
9. Estados verificados por tela: carregando (leitura de colunas), vazio (busca, auxiliares, fluxo), erro (validação, leitura de arquivo) e sucesso (salvamento simulado, execução concluída).

### 8.2 Testes
| Camada | Ferramenta | Conteúdo |
|---|---|---|
| Unitário/componente | Vitest + Testing Library | `ui/*`; validação de obrigatórios do NovoProcesso (incluindo o foco no primeiro erro pelos IDs atuais); limite de auxiliares; reordenação de etapas; busca normalizada (sem acentos); progresso do modal com timers falsos |
| Visual | Playwright `toHaveScreenshot` | a matriz da §0: 10 estados × temas × viewports, com linha de base gerada **antes** do L1 |
| Acessibilidade | `@axe-core/playwright` | os mesmos estados, falhando em `serious` ou `critical` |
| Revisão | agentes `typescript-reviewer`, `react-reviewer` e skill `code-review-and-quality` | ao fim de cada lote, com revisor diferente do autor |

---

## 9. Decisões que dependem de você

| ID | Decisão | Opções (recomendada primeiro) |
|---|---|---|
| **D1** | Escopo da modernização (conflito C1) | **(A) Evolutiva**: fundação + correções, mantendo a estrutura das telas · (B) Redesign das telas, contrariando o `projeto.md` §14 e §17 |
| **D2** | Infraestrutura de testes (dependências novas, só de desenvolvimento) | **(A) Adicionar** `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `@playwright/test` e `@axe-core/playwright` · (B) Sem testes automatizados: só build, typecheck e capturas manuais, e reporto que TDD não foi aplicado |
| **D3** | Mudanças de comportamento e conteúdo | (a) clicar no card **abre a execução sem iniciar**, e editar fica só no lápis; (b) "Executar" **abre o modal sem iniciar**, com campos vazios em vez de caminhos fictícios; (c) remover o slogan e reescrever o texto do banner; (d) remover o nome fixo do perfil. Pode aprovar cada item separadamente |
| **D4** | Dividir `index.css` em `src/styles/*` (refatoração estrutural) | **(A) Dividir** no L1 · (B) Manter um arquivo único, só limpo e reorganizado |
| **D5** | Fonte | **(A) Manter as fontes nativas do Windows** · (B) Adicionar uma fonte self-hosted (ex.: IBM Plex Sans, cerca de 60 kB) |
| **D6** | Janela do Tauri e asset do banner | (a) mudar `tauri.conf.json` para 1280×800 com `minWidth` 960 e `minHeight` 640; (b) converter o banner para WebP (de 2,29 MB para cerca de 150–250 kB estimados) |

---

## 10. Riscos de regressão e dependências

| Risco | Mitigação |
|---|---|
| A cascata do CSS global afeta várias telas ao mesmo tempo (classes compartilhadas, 9 seletores redefinidos) | Linha de base visual antes do L1; comparação de capturas em todas as telas a cada lote |
| IDs usados por `getElementById` no foco de erro (`nome-do-processo`, `principal-1`, `nome-do-arquivo-de-sa-da`, `pasta-de-destino`, `arquivo-script-python`) | `ui/Field` recebe o `id` explicitamente; teste unitário cobre o foco no primeiro erro |
| `dnd-kit`: estilos de `transform` e `transition` no item arrastável | Não mexer na estrutura de `setNodeRef`/`listeners`; teste de reordenação por botões; captura do estado de arraste |
| `<dialog>` nativo: `showModal`/`close` e o `onCancel` (Esc) | Manter o ciclo de vida atual; teste de Esc fecha e de foco retorna |
| Mudança de token afeta os dois temas | Validação de contraste automática (axe) em light e dark |
| A fonte no Linux difere da do Windows, então as capturas podem divergir do app real | Tolerância no `toHaveScreenshot`; validação final no Windows por você |
| `ProcessCardAction` sobreposto ao card (z-index) | Se a D3(a) for aprovada, revisar a ordem de tabulação e o leitor de tela |
| Lotes paralelos L3 a L7 | Propriedade exclusiva de arquivos (§7); `index.css` e `ui/*` congelados após o L2, e mudanças posteriores voltam por um único dono |

---

## 11. Decisões aprovadas (21/10/2026)

| ID | Decisão |
|---|---|
| D1 | **Redesign das telas (B).** Exceção explícita, autorizada pelo responsável, ao `projeto.md` §14 ("não redesenhar a tela inteira") e §17 ("redesenhar tudo"). Continuam valendo: identidade SEDUC-MT, light/dark, React/Tauri, navegação por estado, nomes da navegação e dos campos, e o texto do banner. |
| D2 | **Infraestrutura de testes completa (A):** Vitest + Testing Library + jsdom + Playwright + axe. |
| D3 | (a) **Aprovado:** clicar no card abre o modal de execução **sem iniciar**; editar fica só no lápis. (b) **Aprovado:** "Executar" abre o modal sem iniciar e sem caminhos fictícios. (c) **Não aprovado:** slogan e texto do banner **permanecem**. (d) **Aprovado:** remover o nome fixo do perfil. |
| D4 | **Aprovado:** dividir `index.css` em `src/styles/*`. |
| D5 | **Aprovado:** IBM Plex Sans self-hosted. |
| D6 | **Aprovado:** janela do Tauri com 1280×800 e mínimo de 960×640; banner em WebP. |

Modo de redesign (skill repaint §N): **overhaul**, ou seja, linguagem visual nova com preservação do conteúdo e da arquitetura de informação. A especificação visual fica em [`DESIGN.md`](../DESIGN.md).
