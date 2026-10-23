# DESIGN.md — DataHub SEDUC-MT

Fonte única das decisões visuais. Toda tela nova ou alterada **reusa estes tokens**; não crie paleta paralela.
Contexto e diagnóstico: [`docs/ux-ui-modernization-plan.md`](docs/ux-ui-modernization-plan.md).

## Registro, identidade e âncoras

- **Registro:** `product-app` (ferramenta interna, uso diário por analistas, janela desktop Windows).
- **Modo:** redesign *overhaul* (aprovado em 21/10/2026): linguagem visual nova sobre o mesmo conteúdo e a mesma arquitetura de informação. Nomes da navegação, rótulos de campo e texto do banner não mudam.
- **Identidade (herdada, não reinventada):** brasão de MT, sede da SEDUC no banner, navy no dark, cinza muito claro no light, azul institucional para ação primária, ícones Lucide coloridos por processo/ferramenta. A faixa tricolor (verde, ouro e azul) é a **assinatura institucional**: aparece no banner e na marca da sidebar, e em nenhum outro lugar.
- **Exclusões:** sem gradientes decorativos, sem glassmorphism, sem neon e sem emoji como ícone; nenhuma cor fora da paleta, exceto as cores de identidade de entidades (`corIcone`) e os status.
- **Âncoras (estrutura e densidade, não aparência):** IBM Carbon para densidade de ferramenta de dados (listas operacionais, linhas de 48px, grid de 4px); Fluent 2 para affordances de desktop Windows (painel mestre-detalhe, barra de comandos no rodapé dos formulários).

## Tipografia

| Papel | Face | Peso | Tamanho/entrelinha |
|---|---|---|---|
| Interface (tudo) | **IBM Plex Sans Variable** (self-hosted, `@fontsource-variable/ibm-plex-sans`) | 400 corpo · 500 rótulos · 600 títulos | — |
| Mono (caminhos, logs, colunas, números de log) | `Cascadia Mono`, `Consolas`, `ui-monospace` (nativas do Windows) | 400 | — |

Escala (`--text-*`): `xs` 12/16 · `sm` 13/20 · `md` 14/22 (base) · `lg` 16/24 · `xl` 20/28 · `2xl` 26/32.
**Nenhum texto renderizado abaixo de 12px** (verificado no e2e). Caixa alta só em rótulos de grupo (12px, `letter-spacing` 0,04em).
Desvio consciente da regra "contraste de peso ≥ 400": em `product-app` o par 600/400 mantém a calma da interface.

## Cor (tokens semânticos)

Os valores de base continuam os de `src/styles/tokens.css`. As mudanças do redesign se limitam ao contraste e às variantes `soft`.

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--bg-app` | `#f3f5f8` | `#0b1422` | fundo da janela |
| `--bg-sidebar` / `--bg-card` | `#ffffff` | `#0e1929` / `#111e30` | superfícies |
| `--bg-card-secondary` / `--bg-input` | `#f7f9fb` | `#0e1a2b` / `#0c1828` | superfície recuada, campos |
| `--border` / `--border-hover` | `#dde3ec` / `#aebbcc` | `#24344a` / `#415773` | divisórias, contorno |
| `--text-primary` | `#16283f` | `#e8eff8` | títulos, valores |
| `--text-secondary` | `#475870` | `#b1bfd2` | corpo |
| `--text-muted` | `#56667c` (≥ 4,5:1 sobre `--bg-app`, `--accent-soft` e `--banner-bg`) | `#90a2bc` | metadados |
| `--accent` / `--accent-hover` / `--accent-soft` | `#245bcc` / `#194aa9` / `#e8effc` | `#75a8ff` / `#97bdff` / `#1c3151` | ação primária, seleção |
| `--success` / `--warning` / `--danger` | `#087853` / `#8a5b00` / `#bf2f3b` | `#64d7af` / `#efc269` / `#ff9299` | status |
| `--*-soft` | `color-mix(status 10%, --bg-card)` | idem com 16% | fundo de aviso |

## Espaço, raio, elevação e movimento

- **Espaço** (base 4): `--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-6` 24 · `--space-8` 32. Dentro de um grupo, 8–12; entre seções, 24–32.
- **Raio:** `--radius-sm` 6 (campos, chips, botões) · `--radius-md` 10 (painéis, linhas de lista) · `--radius-lg` 14 (diálogo, banner).
- **Elevação:** `--shadow-surface` (painéis: 1px de contorno + sombra difusa de 2 camadas) · `--shadow-dialog`.
- **Movimento:** `--duration-fast` 120ms · `--duration-base` 200ms · `--ease-out` `cubic-bezier(.2,.8,.2,1)`. Anima só `transform`, `opacity` e cores. Respeita `prefers-reduced-motion`.
- **Foco:** `outline: 2px solid var(--accent); outline-offset: 2px` em todo elemento interativo.

## Layout

- **Janela:** inicial 1280×800, mínima 960×640 (`tauri.conf.json`).
- **Shell:** sidebar de 240px (recolhida: 64px) + coluna de conteúdo. A sidebar recolhe automaticamente abaixo de 1100px de largura, a menos que o usuário a tenha expandido manualmente.
- **Sem barra superior:** removida a pedido em 22/10/2026. O alternador de tema fica no rodapé da sidebar, acima de "Recolher sidebar".
- **Rolagem:** cada página rola no próprio contêiner (`.page-scroll` / `.form-content`); na aba Ferramentas (≥1100px), catálogo e painel rolam de forma independente.
- **Cabeçalho de página:** botão Voltar opcional, título (`2xl`), descrição (`sm`) e um slot de ações à direita. Nada em `position: fixed` sobre o conteúdo.
- **Conteúdo:** largura máxima de 1440px; formulários com largura máxima de 880px na coluna principal.

## Componentes compartilhados (`src/components/ui/`)

`Button` (primary, secondary, ghost, danger, icon) · `Field` (rótulo, controle, dica, erro e obrigatório) · `SectionTitle` · `OptionCard` · `FileField` · `ExplorerField` · `SimulationNotice` · `StatusText` · `Checkbox` · `SelectableChip`.
**Caminhos de arquivo e pasta** (pasta de destino, planilhas e arquivo de saída da execução, script Python) usam sempre `ExplorerField`: um campo só, que abre o explorador (`utils/explorador.ts`: diálogo nativo do Windows no app desktop, seletor do navegador fora dele). Não há campo para digitar ou colar caminho.
Estados obrigatórios em cada componente interativo: padrão, hover, foco, ativo, desabilitado, e carregando/vazio/erro quando aplicável.

## Linguagem

- **Termo único** para o que não é real: **"Simulação"** (componente `SimulationNotice`). Nunca "Mock", "Demonstração" ou "Prévia simulada".
- Erros dizem o que falta e o que fazer ("Selecione o arquivo principal."). Botões usam verbo ("Executar", "Salvar processo").
- Sem travessão em texto de interface.

## Regras vindas de rejeições

_(nenhuma ainda)_
