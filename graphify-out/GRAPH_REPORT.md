# Graph Report - SEDUC---DataHub  (2026-10-22)

## Corpus Check
- Corpus is ~37,602 words - fits in a single context window. You may not need a graph.

## Summary
- 484 nodes · 975 edges · 35 communities (26 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Modal de Execução e Home
- Domínio de Ferramentas
- Configuração de Processo
- Shell e Testes do App
- Config TypeScript
- Formulário de Ferramenta
- Config Tauri
- Visão do Projeto (AGENTS)
- Manifesto do Pacote
- Dependências de Dev
- Dependências de Runtime
- Regras de Engenharia
- Design System
- Fluxo Novo Processo
- Plano de Modernização UX
- Scripts npm
- Config TS Node
- Regra Sugerir Abordagem
- Testes E2E de Qualidade
- Config Vite e Vitest
- Permissões Tauri
- Regra Isolamento de Domínio
- Diagnóstico de UX
- Config Prettier
- Brasão de MT
- Banner SEDUC
- Pacote Cargo
- README do Template

## God Nodes (most connected - your core abstractions)
1. `lucide-react` - 27 edges
2. `NovoProcesso()` - 26 edges
3. `ConfigurarProcesso()` - 25 edges
4. `Button()` - 21 edges
5. `IconButton()` - 20 edges
6. `PainelFerramenta()` - 20 edges
7. `AGENTS.md — DataHub (projeto.md)` - 20 edges
8. `App()` - 19 edges
9. `react` - 18 edges
10. `UX/UI Modernization Plan (DataHub SEDUC-MT)` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Scope Preservation / Never Refactor Without Authorization` --semantically_similar_to--> `Rule Compliance: explicit approval, never interpret silence as approval`  [INFERRED] [semantically similar]
  AgentsRule/ask-refactoring.md → CLAUDE.md
- `Operation Rules (preserve architecture, code is truth, no mock as real)` --semantically_similar_to--> `Scope Preservation / Never Refactor Without Authorization`  [INFERRED] [semantically similar]
  projeto.md → AgentsRule/ask-refactoring.md
- `Mandatory Engineering Rules (.AgentsRule/)` --references--> `Rule: Suggest the Best Approach`  [AMBIGUOUS]
  CLAUDE.md → AgentsRule/suggest-code.md
- `Rule: Suggest the Best Approach` --references--> `Domain Isolation Rule (.AgentsRule/domain-isolation.md)`  [INFERRED]
  AgentsRule/suggest-code.md → CLAUDE.md
- `Approved Decisions 21/10/2026 (redesign overhaul, test infra, IBM Plex Sans, split index.css, 1280x800 window, WebP banner)` --rationale_for--> `IBM Plex Sans Variable typography + Cascadia Mono`  [INFERRED]
  docs/ux-ui-modernization-plan.md → DESIGN.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent engineering governance rules (ask before refactor, suggest best approach, domain isolation, compliance)** — agentsrule_ask_refactoring_ask_before_refactoring_rule, agentsrule_suggest_code_suggest_best_approach_rule, claude_domain_isolation_rule, claude_rule_compliance, projeto_operation_rules [INFERRED 0.85]
- **DataHub redesign foundation (tokens, typography, shared components, approved decisions)** — design_design_system, design_semantic_color_tokens, design_typography_scale, design_shared_ui_components, docs_ux_ui_modernization_plan_approved_decisions, docs_ux_ui_modernization_plan_token_standardization [INFERRED 0.85]
- **DataHub process lifecycle (create, configure, execute)** — projeto_novo_processo_flow, projeto_configurar_processo_flow, projeto_execute_process_modal, projeto_processo_domain [INFERRED 0.85]

## Communities (35 total, 9 thin omitted)

### Community 0 - "Modal de Execução e Home"
Cohesion: 0.06
Nodes (68): lucide-react, react, CampoArquivo(), CamposArquivos, camposDaConfiguracao(), camposVazios, etapasSimuladas, ExecuteProcessModal() (+60 more)

### Community 1 - "Domínio de Ferramentas"
Cohesion: 0.07
Nodes (46): xlsx, ExecucaoSimulada(), useExecucaoSimulada(), Controlado(), ABA_CONSOLIDADA, AbaPrevista, abasDividirPor(), cabecalhosDivergentes() (+38 more)

### Community 2 - "Configuração de Processo"
Cohesion: 0.08
Nodes (38): @dnd-kit/sortable, ProcessSteps(), Checkbox(), ehFerramentaComParametros(), normalizarParametros(), criarConfiguracaoProcessoMock(), criarEtapa(), ferramentasPorProcesso (+30 more)

### Community 3 - "Shell e Testes do App"
Cohesion: 0.07
Nodes (28): react-dom, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event, vitest, App(), assinarJanelaEstreita(), lerJanelaEstreita() (+20 more)

### Community 4 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+10 more)

### Community 5 - "Formulário de Ferramenta"
Cohesion: 0.20
Nodes (16): CampoCor(), ControleCampo, corDeTexto(), FormularioDicionario(), FormularioFerramenta(), FormularioFerramentaProps, ListaDeColunas(), PreviaZebra() (+8 more)

### Community 6 - "Config Tauri"
Cohesion: 0.11
Nodes (17): app, security, windows, build, beforeBuildCommand, beforeDevCommand, devUrl, frontendDist (+9 more)

### Community 7 - "Visão do Projeto (AGENTS)"
Cohesion: 0.15
Nodes (16): Low Priority Diagnosis B1-B5 (fictional profile, slug IDs, unsaved log options), AGENTS.md — DataHub (projeto.md), Code Rules (TypeScript, React, Tailwind, Portuguese naming, Prettier), ConfigurarProcesso configuration flow (step 2), Current Priorities, DataHub internal desktop app (SEDUC-MT), Ferramenta (domain concept, reusable step), Mocks and Pending Persistence (+8 more)

### Community 8 - "Manifesto do Pacote"
Cohesion: 0.12
Nodes (16): name, private, type, version, @dnd-kit/core, @dnd-kit/utilities, @fontsource-variable/ibm-plex-sans, jsdom (+8 more)

### Community 9 - "Dependências de Dev"
Cohesion: 0.13
Nodes (15): devDependencies, @axe-core/playwright, jsdom, @playwright/test, prettier, @tauri-apps/cli, @testing-library/jest-dom, @testing-library/react (+7 more)

### Community 10 - "Dependências de Runtime"
Cohesion: 0.15
Nodes (13): dependencies, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fontsource-variable/ibm-plex-sans, lucide-react, react, react-dom (+5 more)

### Community 11 - "Regras de Engenharia"
Cohesion: 0.20
Nodes (5): Rule: Ask Before Refactoring, Domain Isolation Rule (.AgentsRule/domain-isolation.md), Mandatory Engineering Rules (.AgentsRule/), Mandatory 8-step Workflow (Fluxo de Trabalho Obrigatório), CLAUDE.md Project Instructions (Instruções do Projeto)

### Community 12 - "Design System"
Cohesion: 0.20
Nodes (10): DESIGN.md: DataHub SEDUC-MT Design System, Fluent 2 (Windows desktop affordances anchor), IBM Carbon (density anchor), IBM Plex Sans Variable typography + Cascadia Mono, SEDUC-MT Institutional Identity (tricolor signature, navy dark, light gray light), Semantic Color Tokens (light/dark), Shell Layout (240px sidebar, auto-collapse <1100px, no top bar), Pending Decisions D1-D6 (+2 more)

### Community 13 - "Fluxo Novo Processo"
Cohesion: 0.20
Nodes (3): NovoProcesso(), montarProcesso(), proximo()

### Community 14 - "Plano de Modernização UX"
Cohesion: 0.20
Nodes (10): Shared UI Components (src/components/ui), Space, Radius, Elevation and Motion Tokens, Acceptance Criteria and Test Strategy (axe zero serious, >=12px text, no overflow, Vitest, Playwright), AI Slop Patterns identified, Audit Methodology (tsc, build, Playwright captures, axe-core, keyboard, overflow), Implementation Batches L0-L8, Regression Risks and Mitigations, Shared Components to Create (ui/Button, Field, SectionTitle, OptionCard, FileField, SimulationNotice, StatusText, Checkbox, SelectableChip) (+2 more)

### Community 15 - "Scripts npm"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, preview, tauri, test, test:e2e (+1 more)

### Community 16 - "Config TS Node"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 17 - "Regra Sugerir Abordagem"
Cohesion: 0.33
Nodes (4): Out-of-Scope Refactoring Suggestion Format, Business Logic and Architectural Decision Triggers, Suggested Improvement A/B Decision Format, Rule: Suggest the Best Approach

### Community 18 - "Testes E2E de Qualidade"
Cohesion: 0.33
Nodes (4): estados, viewports, @axe-core/playwright, @playwright/test

### Community 19 - "Config Vite e Vitest"
Cohesion: 0.33
Nodes (3): @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 20 - "Permissões Tauri"
Cohesion: 0.33
Nodes (5): description, identifier, permissions, $schema, windows

### Community 21 - "Regra Isolamento de Domínio"
Cohesion: 0.40
Nodes (4): Domain Isolation Definition of Done, Dependency and Impact Mapping, Public Signature and Contract Analysis, Mandatory Regression Verification

### Community 22 - "Diagnóstico de UX"
Cohesion: 0.40
Nodes (4): Typography Scale --text-* (min 12px), High Priority Diagnosis A1-A7 (small typography, 800x600 fit, brand truncation, inconsistent simulation naming, contrast), Medium Priority Diagnosis M1-M11 (card click action, auto-start execution, duplicated components, global CSS), ExecuteProcessModal (simulated execution)

### Community 23 - "Config Prettier"
Cohesion: 0.40
Nodes (5): prettier, semi, singleQuote, tabWidth, trailingComma

### Community 24 - "Brasão de MT"
Cohesion: 0.50
Nodes (4): Estado de Mato Grosso, Identidade visual institucional (SEDUC-MT), Brasao de Mato Grosso (coat of arms image), Lema 'Virtute Plusquam Auro'

### Community 25 - "Banner SEDUC"
Cohesion: 0.67
Nodes (4): Governo de Mato Grosso (state government brand/coat of arms), SEDUC Banner Image (seduc-banner.webp), SEDUC institutional visual identity (blue/white palette, sunset hero), Secretaria de Estado de Educação headquarters building facade

## Ambiguous Edges - Review These
- `Rule: Suggest the Best Approach` → `Mandatory Engineering Rules (.AgentsRule/)`  [AMBIGUOUS]
  CLAUDE.md · relation: references

## Knowledge Gaps
- **37 isolated node(s):** `@fontsource-variable/ibm-plex-sans`, `@tauri-apps/api`, `@tauri-apps/plugin-opener`, `tailwindcss`, `@tauri-apps/cli` (+32 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 222 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `Modal de Execução e Home` to `Domínio de Ferramentas`, `Configuração de Processo`, `Shell e Testes do App`, `Formulário de Ferramenta`, `Manifesto do Pacote`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **What connects `@fontsource-variable/ibm-plex-sans`, `@tauri-apps/api`, `@tauri-apps/plugin-opener` to the rest of the system?**
  _37 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Modal de Execução e Home` be split into smaller, more focused modules?**
  _Cohesion score 0.05518394648829431 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Modal de Execução e Home` to `Domínio de Ferramentas`, `Configuração de Processo`, `Shell e Testes do App`, `Formulário de Ferramenta`, `Manifesto do Pacote`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `Domínio de Ferramentas` be split into smaller, more focused modules?**
  _Cohesion score 0.07337662337662337 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Dependências de Dev` to `Manifesto do Pacote`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Rule: Suggest the Best Approach` and `Mandatory Engineering Rules (.AgentsRule/)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._