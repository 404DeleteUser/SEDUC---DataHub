# DESIGN.md — DataHub SEDUC-MT

Fonte única das decisões visuais. Toda tela nova ou alterada **reusa estes tokens**; não crie paleta paralela.
Contexto e diagnóstico: [`docs/ux-ui-modernization-plan.md`](docs/ux-ui-modernization-plan.md).

## Registro, identidade e âncoras

- **Registro:** `product-app` (ferramenta interna, uso diário por analistas, janela desktop Windows).
- **Modo:** redesign *overhaul* (aprovado em 21/10/2026): linguagem visual nova sobre o mesmo conteúdo e a mesma arquitetura de informação. Nomes da navegação e rótulos de campo não mudam. O texto do banner (eyebrow, título e parágrafo) se mantém; o lema "Interface que organiza / Processos que transformam" saiu em 23/10/2026.
- **Identidade (herdada, não reinventada):** brasão de MT, "SEDUC" em ASCII animado no banner (substituiu a foto da sede em 23/10/2026), quase preto no dark (substituiu o navy em 23/10/2026), cinza muito claro no light, azul institucional para ação primária, ícones Lucide coloridos por processo/ferramenta. A faixa tricolor (verde, ouro e azul) é a **assinatura institucional**: aparece no banner e na marca da sidebar, e em nenhum outro lugar.
- **Exclusões:** sem gradientes decorativos, sem glassmorphism, sem neon e sem emoji como ícone; nenhuma cor fora da paleta, exceto as cores de identidade de entidades (`corIcone`), os status e as cores do próprio brasão de MT no brasão em ASCII (Perfil e Entrada). Exceção aprovada em 23/10/2026: o feixe de luz do "SEDUC" em ASCII no banner (só azuis da paleta).
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

Os valores de base continuam os de `src/styles/tokens.css`. O tema escuro passou a ser "quase preto" em 23/10/2026 (superfícies neutras, acentos azuis); o tema claro não mudou. Continua havendo só dois temas: não crie paleta paralela.

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--bg-app` | `#f3f5f8` | `#05070b` | fundo da janela |
| `--bg-sidebar` / `--bg-card` | `#ffffff` | `#080b10` / `#0d1117` | superfícies |
| `--bg-card-secondary` / `--bg-input` | `#f7f9fb` | `#0a0d13` / `#07090d` | superfície recuada, campos |
| `--border` / `--border-hover` | `#dde3ec` / `#aebbcc` | `#1b222c` / `#303b4b` | divisórias, contorno |
| `--text-primary` | `#16283f` | `#e7ecf2` | títulos, valores |
| `--text-secondary` | `#475870` | `#a6b1c0` | corpo |
| `--text-muted` | `#56667c` (≥ 4,5:1 sobre `--bg-app`, `--accent-soft` e `--banner-bg`) | `#8794a6` (5,5–6,5:1 sobre os fundos escuros) | metadados |
| `--accent` / `--accent-hover` / `--accent-soft` | `#245bcc` / `#194aa9` / `#e8effc` | `#6f9fff` / `#94b8ff` / `#111c30` | ação primária, seleção |
| `--success` / `--warning` / `--danger` | `#087853` / `#8a5b00` / `#bf2f3b` | `#5fd3a8` / `#e8bd62` / `#ff8b93` | status |
| `--*-soft` | `color-mix(status 10%, --bg-card)` | idem com 12% | fundo de aviso |

## Espaço, raio, elevação e movimento

- **Espaço** (base 4): `--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-6` 24 · `--space-8` 32. Dentro de um grupo, 8–12; entre seções, 24–32.
- **Raio:** `--radius-sm` 6 (campos, chips, botões) · `--radius-md` 10 (painéis, linhas de lista) · `--radius-lg` 14 (diálogo, banner).
- **Elevação:** `--shadow-surface` (painéis: 1px de contorno + sombra difusa de 2 camadas) · `--shadow-dialog`.
- **Movimento:** `--duration-fast` 120ms · `--duration-base` 200ms · `--ease-out` `cubic-bezier(.2,.8,.2,1)`. Anima só `transform`, `opacity` e cores, **exceto** as ilustrações ASCII em `<canvas>` (`src/components/ascii/`), que redesenham a grade a 24–30 fps (aprovado em 23/10/2026). Tudo respeita `prefers-reduced-motion` (as ilustrações ficam num quadro parado).
- **Foco:** `outline: 2px solid var(--accent); outline-offset: 2px` em todo elemento interativo.
  Exceção (aprovada em 23/10/2026): os campos da Entrada e da `/redefinir-senha` não têm caixa, só a linha de base de 1px (`--border-hover`); no foco, ela vira 2px em `--accent` (em erro, `--danger`), sem o contorno.

## Layout

- **Janela:** inicial 1280×800, mínima 960×640 (`tauri.conf.json`).
- **Shell:** sidebar de 240px (recolhida: 64px) + coluna de conteúdo. A sidebar recolhe automaticamente abaixo de 1100px de largura, a menos que o usuário a tenha expandido manualmente.
- **Sem barra superior:** removida a pedido em 22/10/2026. O alternador de tema fica no rodapé da sidebar, acima de "Recolher sidebar".
- **Rolagem:** cada página rola no próprio contêiner (`.page-scroll` / `.form-content`); na aba Ferramentas (≥1100px), catálogo e painel rolam de forma independente.
- **Cabeçalho de página:** botão Voltar opcional, título (`2xl`), descrição (`sm`) e um slot de ações à direita. Nada em `position: fixed` sobre o conteúdo.
- **Conteúdo:** largura máxima de 1440px; formulários com largura máxima de 880px na coluna principal.

## Entrada (`src/pages/Entrada.tsx`, `src/styles/entrada.css`)

Janela inteira, sem rolagem até 960×640, fundo `--bg-app`, sem cartões nem divisórias. Duas colunas no centro, 56px entre elas (48px abaixo de 1024px): à esquerda o brasão em ASCII (até 440×460px), à direita o formulário solto, com 240px. Abaixo de 720px, o brasão vai para cima (22vh). A `/redefinir-senha` usa a mesma moldura (`components/entrada/MolduraEntrada.tsx`).

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
