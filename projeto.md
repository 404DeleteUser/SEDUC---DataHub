# AGENTS.md — DataHub

## 0. Regras de operação

Antes de alterar código:
1. Leia este arquivo.
2. Inspecione o repositório e os arquivos da tarefa.
3. Preserve arquitetura, UI e decisões existentes.
4. Evite refatorações amplas sem necessidade.
5. Se este arquivo divergir do código, o código atual é a fonte de verdade; sinalize a divergência.
6. Não apresente mock como funcionalidade real.

## 1. Projeto

**DataHub** é um app desktop interno da **SEDUC-MT** para centralizar e executar rotinas de planilhas/dados sem exigir que o usuário opere scripts Python manualmente.

Casos típicos:
- cruzamento de bases;
- vigência;
- consolidação de relatórios;
- duplicatas;
- limpeza/formatação;
- zebragem;
- exclusão de linhas vazias;
- auditorias;
- geração de arquivos.

Princípios: simplicidade, baixa carga cognitiva, consistência, linguagem clara, feedback, prevenção de erros, rastreabilidade e evolução incremental.

## 2. Stack

Frontend/desktop:
- React
- TypeScript
- Vite
- Tailwind CSS
- Tauri
- Lucide React

Bibliotecas usadas:
- `xlsx`
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

Futuro:
- integração com rotinas Python existentes.

**Não definir arquitetura definitiva React/Tauri ↔ Python sem analisar o estado real do repo e a tarefa.**

## 3. Estrutura conhecida

```text
src/
├── assets/
├── components/
│   ├── ui/                      # Button, IconButton, Field, FileField, OptionCard,
│   │                            # Checkbox, SelectableChip, SectionTitle,
│   │                            # SimulationNotice, StatusText (+ ui.test.tsx)
│   ├── Sidebar.tsx
│   ├── ThemeToggle.tsx
│   ├── PageHeader.tsx           # PageHeader + ProcessSteps
│   ├── ProcessCardAction.tsx
│   ├── FolderPicker.tsx
│   └── ExecuteProcessModal.tsx
├── mock/
│   ├── homeMock.ts
│   ├── ferramentasMock.ts
│   ├── processosMock.ts
│   └── configuracaoProcessosMock.ts
├── pages/
│   ├── Home.tsx
│   ├── Processos.tsx
│   ├── NovoProcesso.tsx
│   ├── novo-processo/           # subcomponentes da etapa 1
│   ├── ConfigurarProcesso.tsx
│   └── configurar-processo/     # subcomponentes da etapa 2
├── styles/                      # tokens, base, ui, shell e um arquivo por tela
├── test/                        # testes de caracterização e de decisões aprovadas
├── types/
│   └── processo.ts
├── App.tsx
├── main.tsx
└── index.css                    # ponto de entrada: importa src/styles/*

e2e/                             # Playwright: axe, fonte mínima, overflow, teclado

src-tauri/
└── ...
```

Confirme a estrutura real antes de editar.

## 4. Navegação

Controlada por estado em `App.tsx`; não assumir React Router.

Páginas:
- `inicio`
- `processos`
- `novo-processo`
- `configurar-processo`

A sidebar recebe a página atual + callback de navegação.

O item **Processos** permanece ativo em:
- Processos
- Novo Processo
- Configuração do Processo

Não introduzir React Router sem necessidade/pedido.

## 5. Domínio

### Processo
Rotina composta por etapas. Pode conter:
- arquivos principais;
- arquivos auxiliares;
- identidade visual;
- etapas;
- condições;
- código associado;
- logs;
- saída.

Exemplos:
- Cruzamento SEAP x Folha
- Verificação de Vigência
- Consolidação de Relatórios
- Validação de Base Funcional

### Ferramenta
Operação menor/reutilizável usada como etapa.

Exemplos:
- Juntar Planilhas
- Remover Duplicatas
- Remover Vazios
- Validar Dados
- Formatar Planilha
- Zebrar Planilha

## 6. Fluxo de criação

### `NovoProcesso.tsx`
Coleta:
- nome;
- descrição;
- ícone/imagem/cor;
- até 2 arquivos principais;
- modo `concatenar | separados`;
- até 3 auxiliares (`nome`, `arquivo`);
- saída (`nome`, `formato`, `pastaDestino`).

Formatos iniciais: XLSX, CSV.

### `ConfigurarProcesso.tsx`
Configura:
- origem do código: `arquivo | pasta`;
- fluxo de ferramentas;
- ordenação/removal/seleção de etapas via `dnd-kit`;
- planilhas da etapa;
- colunas;
- condições;
- logs.

Leitura de cabeçalhos suportada hoje:
- `.xlsx`
- `.xls`
- `.csv`

via `xlsx`.

Condições conhecidas:
- `coluna-existe`
- `igual`
- `diferente`
- `nao-vazio`

Logs configuráveis:
- linhas processadas;
- tempo de execução;
- arquivos processados;
- etapas executadas;
- indicador principal.

## 7. Tipos

Fonte principal: `src/types/processo.ts`

Tipos relevantes:
```ts
ProcessoBase
AuxiliarProcesso
ArquivoDisponivel
EtapaProcesso
PlanilhaEtapa
CondicaoEtapa
TipoCondicaoEtapa
```

Regras:
- reutilizar tipos existentes;
- evitar `any`;
- não duplicar modelos equivalentes em páginas diferentes.

## 8. Tema

Há light/dark mode global.

Controle:
- `App.tsx`
- persistência em `localStorage`
- `data-theme="light|dark"`

Botão global:
`src/components/ThemeToggle.tsx`, montado na barra superior (`.app-topbar`) pelo `App.tsx`.

Não duplicar lógica de tema em páginas.

### Cores
Paleta centralizada em `src/styles/tokens.css`. Decisões e escala completa (tipografia, espaço, raio, movimento) em `DESIGN.md`.

Variáveis:
```css
--bg-app
--bg-sidebar
--bg-card
--bg-card-secondary
--bg-input
--border
--border-hover
--text-primary
--text-secondary
--text-muted
--hover
--banner-bg
--banner-fade
--banner-overlay
--banner-accent
--window-control
--window-control-hover
--window-divider
--accent
--accent-hover
--accent-soft
--success
--warning
--danger
```

Uso preferido:
```tsx
bg-[var(--bg-app)]
bg-[var(--bg-card)]
bg-[var(--bg-input)]
border-[var(--border)]
text-[var(--text-primary)]
text-[var(--text-secondary)]
text-[var(--text-muted)]
```

Evitar cores estruturais fixas de dark mode em componentes:
```tsx
bg-[#06111c]
bg-[#071522]
bg-[#0b1c2b]
bg-[#091927]
border-[#173249]
border-[#24445c]
text-slate-300
text-slate-400
text-white
```

Cores fixas são permitidas quando representam identidade/status:
- ícones coloridos;
- ação primária azul;
- erro vermelho;
- sucesso verde.

**Nunca deixar texto branco no light mode por herança acidental.**

## 9. CSS global

Usar `src/index.css` como ponto de entrada global; ele importa `src/styles/*` (tokens, base, ui, shell e um arquivo por tela).

Não reintroduzir o `App.css` padrão do template Vite/Tauri nem estilos genéricos antigos de:
- `.logo`
- `.container`
- `.row`
- `button`
- `input`
- `prefers-color-scheme`

Componentes e classes reutilizáveis (ver `DESIGN.md`):
```css
.ui-panel  .ui-input  .ui-empty  .ui-alert  /* + componentes de src/components/ui */
```

Reutilize antes de duplicar grandes blocos Tailwind. As classes antigas (`.painel-processo`, `.campo-processo`, `.botao-secundario`, `.seletor-arquivo`, `.opcao-modo`, `.estado-vazio`) foram substituídas no redesign de 21/10/2026.

## 10. UI atual

### Home
Contém:
- banner institucional;
- Processos em Destaque;
- Ferramentas mais utilizadas;
- Logs de Execução.

Banner:
- imagem SEDUC-MT;
- “Bem-vindo ao DataHub!”;
- descrição;
- frase institucional à direita;
- fades laterais.

Variáveis:
```css
--banner-bg
--banner-fade
--banner-overlay
--banner-accent
```

### Sidebar
Itens conhecidos:
- Início
- Processos
- Ferramentas
- Logs de Execução
- Sites Institucionais
- Coordenadorias e Equipes
- Configurações
- Perfil

Pode ser expandida/recolhida; recolhe automaticamente abaixo de 1100px de largura, salvo escolha manual. Itens sem tela mostram "Em breve". O Perfil não exibe nome fictício.

### `ExecuteProcessModal.tsx`
Objetivo: interface de execução de processo.

Layout:
- esquerda: arquivos/variáveis + Executar;
- direita superior: progresso/barra/etapa/tempo;
- direita inferior: logs.

A execução atual é simulada; não tratar como backend real. O modal abre sem iniciar e sem caminhos fictícios; o termo exibido ao usuário é sempre "Simulação".

## 11. Mocks e persistência

Mocks atuais:
```text
src/mock/homeMock.ts
src/mock/processosMock.ts
src/mock/ferramentasMock.ts
```

Ainda falta consolidar/implementar:
- persistência local de processos;
- listar;
- editar;
- excluir;
- executor Python;
- logs reais;
- progresso real;
- distribuição final.

Migre de mock para real gradualmente. Não introduza backend remoto sem pedido.

## 12. Tauri / desktop

Objetivo:
- seleção nativa de arquivos;
- seleção nativa de pastas;
- drag/drop do Windows Explorer;
- build desktop.

Antes de instalar plugin Tauri:
1. ler `package.json`;
2. ler `src-tauri/Cargo.toml`;
3. ler `src-tauri/tauri.conf.json` ou equivalente;
4. confirmar Tauri v1/v2.

Não assumir versão.

### Controles de janela
Não criar manualmente minimizar/maximizar/fechar só por aparência.

Decisão atual: usar controles nativos do sistema/Tauri.

`ThemeToggle` deve permanecer separado para futura titlebar customizada.

## 13. Integração Python

Fluxo desejado:
```text
DataHub
→ configuração
→ executor
→ Python
→ arquivos resultantes
→ logs/progresso
```

Exemplos conceituais, **não contratos definitivos**:
```python
def executar(entradas, auxiliares, saida, parametros):
    ...
```

```json
{
  "entrypoint": "main.py",
  "inputs": {
    "principal_1": "SEAP",
    "principal_2": "FOLHA"
  }
}
```

Não implementar esses formatos como padrão sem confirmação.

## 14. Regras de UX/UI

> Em 21/10/2026 foi feito um redesign completo com autorização explícita (exceção registrada em `docs/ux-ui-modernization-plan.md` §11). Para mudanças futuras, as regras abaixo voltam a valer, agora sobre o layout redesenhado e os tokens de `DESIGN.md`.

Preservar:
- hierarquia visual;
- interface compacta;
- cards/cantos arredondados;
- Lucide icons;
- ícones coloridos por processo/ferramenta;
- azul para ações principais;
- navy no dark;
- cinza muito claro no light.

Ao ajustar UI:
1. alterar só o necessário;
2. preservar layout/dimensões aprovados;
3. não redesenhar a tela inteira para corrigir cor;
4. não remover funcionalidades;
5. não trocar ícones/nomes sem pedido;
6. manter hover/focus;
7. diferenciar ações destrutivas;
8. validar light e dark.

## 15. Regras de código

### TypeScript
- evitar `any`;
- reutilizar `src/types/`;
- não duplicar modelos.

### React
- componentes funcionais;
- preservar hooks existentes;
- não adicionar estado global sem necessidade;
- não introduzir React Router por conveniência.

### Tailwind
- usar para layout;
- usar CSS variables para tema;
- evitar hexadecimais estruturais espalhados.

### Nomenclatura
Código atual usa português em estados, funções, props e UI. Preserve esse padrão em arquivos existentes.

### Formatação
Projeto usa Prettier. Configuração real (`package.json`):
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

Confirmar configuração real antes de alterar. Não reformatar arquivos não relacionados.

## 16. Validação antes de concluir

Quando aplicável:
1. TypeScript sem erros;
2. build;
3. imports sem duplicados/não usados;
4. light mode;
5. dark mode;
6. navegação;
7. responsividade;
8. botões/funções preservados.

Leia `package.json` para descobrir scripts reais.

Possíveis comandos:
```bash
npm run dev
npm run build
npm run tauri dev
npm run tauri build
npm test            # Vitest: componentes ui, fluxos e decisões aprovadas
npm run test:e2e    # Playwright: axe, fonte ≥12px, overflow, teclado (light/dark × 960/1280/1920)
```

Execute apenas scripts existentes.

## 17. Não fazer sem solicitação

Não:
- trocar React;
- trocar Tauri por Electron;
- criar backend web;
- adicionar banco remoto;
- adicionar autenticação;
- introduzir React Router;
- redesenhar tudo;
- remover light/dark;
- substituir rotinas Python existentes;
- mudar identidade SEDUC-MT.

## 18. Prioridades atuais

1. concluir consistência light/dark;
2. consolidar componentes reutilizáveis;
3. seleção nativa de arquivos/pastas;
4. persistência local;
5. editar/excluir processos;
6. executor Python;
7. logs reais;
8. progresso real;
9. erros robustos;
10. drag/drop do sistema;
11. build/distribuição.

## 19. Fonte de verdade

Ordem:
1. código atual;
2. `AGENTS.md`;
3. `src/types/`;
4. mocks;
5. comentários;
6. docs auxiliares.

## 20. Regra final

Objetivo: manter o DataHub funcional, organizado, legível, consistente e preparado para Tauri/Python.

Preserve trabalho já aprovado quando a tarefa atual não exigir mudança.
