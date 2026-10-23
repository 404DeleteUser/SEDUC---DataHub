# Contrato de eventos da execução (versão 1)

O motor (`datahub-engine executar`) emite **um evento JSON por linha** na saída padrão
e grava os mesmos eventos, na mesma ordem, no arquivo de log da execução
(`<pasta de logs>/<início>_<id>.jsonl`). O app lê a saída ao vivo; a página de Logs lê os arquivos.

Os tipos estão espelhados em `src/domain/eventosExecucao.ts` (app) e em
`engine/datahub_engine/eventos.py` (motor). Os dois lados validam os mesmos exemplos de
`exemplos-validos.jsonl` e `exemplos-invalidos.jsonl`; mudar o contrato exige mudar os três.

## Campos comuns (todo evento)

| Campo | Tipo | Descrição |
|---|---|---|
| `v` | `1` | versão do contrato |
| `execucao` | texto | id da execução (o mesmo em todos os eventos dela) |
| `seq` | inteiro ≥ 1 | ordem do evento, sem saltos |
| `ts` | texto ISO 8601 (UTC, com milissegundos) | quando aconteceu |
| `tipo` | texto | um dos tipos abaixo |

## Tipos

| `tipo` | Campos próprios |
|---|---|
| `execucao.inicio` | `nome`, `origem` (`processo` \| `ferramenta`), `usuario`, `maquina`, `entradas` [{`nome`, `caminho`}], `saida` {`nome`, `caminho`}, `etapas` [{`indice`, `ferramenta`, `parametros`}] |
| `entrada.lida` | `arquivo`, `abas`, `linhas`, `colunas` |
| `etapa.inicio` | `indice`, `ferramenta`, `nome` |
| `progresso` | `percentual` (0–100), `mensagem` |
| `log` | `nivel` (`info` \| `aviso`), `mensagem`, `etapa` (opcional) |
| `etapa.fim` | `indice`, `ferramenta`, `linhas_antes`, `linhas_depois`, `resumo` (objeto de contagens), `duracao_ms` |
| `saida.gravada` | `caminho`, `abas`, `linhas` |
| `execucao.fim` | `status` (`concluido` \| `concluido_com_avisos` \| `erro` \| `cancelado`), `duracao_ms`, `avisos`, `erro` (só quando `status` = `erro`: {`mensagem`, `etapa` opcional, `detalhe` opcional}) |

Um arquivo de log sem `execucao.fim` é uma execução **interrompida** (o app foi fechado ou o
processo morreu); `logs listar` a informa com o status `interrompido`.

## Privacidade

Eventos **nunca** contêm valores de células das planilhas. Só: nomes e caminhos de arquivo,
nomes de coluna, parâmetros digitados pelo usuário e contagens. Exemplo: "Dividir Por" informa
quantas abas criou, não os nomes delas (que vêm dos valores da coluna). Há teste que falha se
um valor de célula aparecer em algum evento.

## Plano de execução (entrada do motor)

```json
{
  "versao": 1,
  "nome": "Auditoria de Faltas",
  "origem": "processo",
  "entradas": [{ "caminho": "C:\\Bases\\faltas.xlsx" }],
  "saida": { "caminho": "C:\\Saida\\faltas-tratado.xlsx" },
  "etapas": [
    { "ferramenta": "eliminar-duplicatas", "parametros": { "colunasChave": ["CPF"] } },
    { "ferramenta": "script-python", "script": { "principal": "C:\\Scripts\\ajuste.py" } }
  ]
}
```

A primeira entrada é a planilha principal; as demais são complementares (usadas pelo
"Mesclar Planilhas"). Os parâmetros têm o mesmo formato dos tipos `Parametros*` do app.

## Códigos de saída do processo

`0` concluído (com ou sem avisos) · `1` erro na execução · `2` plano inválido · `130` cancelado.
Para cancelar, o app escreve `cancelar` (uma linha) na entrada padrão do motor.
