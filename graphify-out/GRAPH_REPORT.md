# Graph Report - SEDUC---DataHub  (2026-10-21)

## Corpus Check
- Corpus is ~29,268 words - fits in a single context window. You may not need a graph.

## Summary
- 349 nodes · 570 edges · 22 communities (14 shown, 8 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Telas e Modal de Execução
- Regras de Engenharia e Design
- Testes E2E e Config Projeto
- Fluxo de Etapas (dnd-kit)
- Cabeçalho, Stepper e Pastas
- Shell do App e Tema
- Config TypeScript
- Config Tauri
- Dependências de Desenvolvimento
- Dependências de Runtime
- TS Config Node
- Permissões Tauri
- Brasão de Mato Grosso
- Banner Institucional SEDUC
- Pacote Rust

## God Nodes (most connected - your core abstractions)
1. `ConfigurarProcesso()` - 21 edges
2. `lucide-react` - 17 edges
3. `App()` - 16 edges
4. `NovoProcesso()` - 16 edges
5. `compilerOptions` - 16 edges
6. `react` - 14 edges
7. `IconButton()` - 14 edges
8. `ExecuteProcessModal()` - 13 edges
9. `Home()` - 11 edges
10. `UX/UI Modernization Plan` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Scope Preservation` --semantically_similar_to--> `UX/UI Preservation Rules (section 14)`  [INFERRED] [semantically similar]
  AgentsRule/ask-refactoring.md → projeto.md
- `Regression Risks and Mitigations` --semantically_similar_to--> `Dependency and Impact Mapping`  [INFERRED] [semantically similar]
  docs/ux-ui-modernization-plan.md → AgentsRule/isolation.md
- `Acceptance Criteria and Test Strategy` --semantically_similar_to--> `Mandatory Regression Verification`  [INFERRED] [semantically similar]
  docs/ux-ui-modernization-plan.md → AgentsRule/isolation.md
- `Mandatory 8-step Workflow` --semantically_similar_to--> `Domain Isolation Definition of Done`  [INFERRED] [semantically similar]
  CLAUDE.md → AgentsRule/isolation.md
- `CLAUDE.md Project Instructions` --references--> `Rule: Domain Isolation`  [AMBIGUOUS]
  CLAUDE.md → AgentsRule/isolation.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Mandatory Agent Engineering Rules** — claude_project_instructions, agentsrule_ask_refactoring_ask_before_refactoring, agentsrule_isolation_domain_isolation, agentsrule_suggest_code_suggest_best_approach [EXTRACTED 0.95]
- **DataHub Design Token System** — design_ibm_plex_sans_typography, design_semantic_color_tokens, design_space_radius_motion_tokens, design_layout_shell, design_shared_ui_components [EXTRACTED 0.95]
- **Process Domain Model and Flow** — projeto_processo_domain, projeto_ferramenta_domain, projeto_process_creation_flow, projeto_processo_types, projeto_execute_process_modal [INFERRED 0.85]

## Communities (22 total, 8 thin omitted)

### Community 0 - "Telas e Modal de Execução"
Cohesion: 0.07
Nodes (52): lucide-react, react, CampoArquivo(), CamposArquivos, camposDaConfiguracao(), camposVazios, etapasSimuladas, ExecuteProcessModal() (+44 more)

### Community 1 - "Regras de Engenharia e Design"
Cohesion: 0.06
Nodes (45): Refactoring Suggestion Format (issue / suggestion / benefit), Domain Isolation Definition of Done, Dependency and Impact Mapping, Public Signature and Contract Analysis, Mandatory Regression Verification, Mandatory Pause for Design Improvements (Option A/B), Exception: Purely Syntactic Improvements, Mandatory 8-step Workflow (+37 more)

### Community 2 - "Testes E2E e Config Projeto"
Cohesion: 0.05
Nodes (40): estados, viewports, name, prettier, semi, singleQuote, tabWidth, trailingComma (+32 more)

### Community 3 - "Fluxo de Etapas (dnd-kit)"
Cohesion: 0.08
Nodes (25): @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, criarConfiguracaoProcessoMock(), criarEtapa(), ferramentasPorProcesso, ferramentasMock, ConfigurarProcesso() (+17 more)

### Community 4 - "Cabeçalho, Stepper e Pastas"
Cohesion: 0.10
Nodes (16): FolderPicker(), PageHeaderProps, PASSOS_DO_PROCESSO, ProcessSteps(), Auxiliar, coresPadrao, IconeOpcao, iconesDisponiveis (+8 more)

### Community 5 - "Shell do App e Tema"
Cohesion: 0.18
Nodes (12): react-dom, @testing-library/user-event, App(), assinarJanelaEstreita(), lerJanelaEstreita(), montarTrilha(), Trilha(), useJanelaEstreita() (+4 more)

### Community 6 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+10 more)

### Community 7 - "Config Tauri"
Cohesion: 0.11
Nodes (17): app, security, windows, build, beforeBuildCommand, beforeDevCommand, devUrl, frontendDist (+9 more)

### Community 8 - "Dependências de Desenvolvimento"
Cohesion: 0.13
Nodes (15): devDependencies, @axe-core/playwright, jsdom, @playwright/test, prettier, @tauri-apps/cli, @testing-library/jest-dom, @testing-library/react (+7 more)

### Community 9 - "Dependências de Runtime"
Cohesion: 0.15
Nodes (13): dependencies, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fontsource-variable/ibm-plex-sans, lucide-react, react, react-dom (+5 more)

### Community 10 - "TS Config Node"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 11 - "Permissões Tauri"
Cohesion: 0.33
Nodes (5): description, identifier, permissions, $schema, windows

### Community 12 - "Brasão de Mato Grosso"
Cohesion: 0.50
Nodes (4): Estado de Mato Grosso, Identidade visual institucional (SEDUC-MT), Brasao de Mato Grosso (coat of arms image), Lema 'Virtute Plusquam Auro'

### Community 13 - "Banner Institucional SEDUC"
Cohesion: 0.67
Nodes (4): Governo de Mato Grosso (state government brand/coat of arms), SEDUC Banner Image (seduc-banner.webp), SEDUC institutional visual identity (blue/white palette, sunset hero), Secretaria de Estado de Educação headquarters building facade

## Ambiguous Edges - Review These
- `Rule: Domain Isolation` → `CLAUDE.md Project Instructions`  [AMBIGUOUS]
  CLAUDE.md · relation: references
- `Rule: Suggest the Best Approach` → `CLAUDE.md Project Instructions`  [AMBIGUOUS]
  CLAUDE.md · relation: references

## Knowledge Gaps
- **23 isolated node(s):** `@fontsource-variable/ibm-plex-sans`, `@tauri-apps/api`, `@tauri-apps/plugin-opener`, `tailwindcss`, `@tauri-apps/cli` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 173 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `Telas e Modal de Execução` to `Testes E2E e Config Projeto`, `Fluxo de Etapas (dnd-kit)`, `Cabeçalho, Stepper e Pastas`, `Shell do App e Tema`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **What connects `@fontsource-variable/ibm-plex-sans`, `@tauri-apps/api`, `@tauri-apps/plugin-opener` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Telas e Modal de Execução` be split into smaller, more focused modules?**
  _Cohesion score 0.06790890269151138 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Telas e Modal de Execução` to `Testes E2E e Config Projeto`, `Fluxo de Etapas (dnd-kit)`, `Cabeçalho, Stepper e Pastas`, `Shell do App e Tema`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Should `Regras de Engenharia e Design` be split into smaller, more focused modules?**
  _Cohesion score 0.06259426847662142 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Rule: Domain Isolation` and `CLAUDE.md Project Instructions`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Rule: Suggest the Best Approach` and `CLAUDE.md Project Instructions`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._