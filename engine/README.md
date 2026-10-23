# Motor de execução do DataHub (`datahub-engine`)

Executa os processos e as ferramentas de verdade e registra o log de cada execução.
O app (Tauri) chama o motor como um programa separado e acompanha os eventos ao vivo.

## Uso

```bash
datahub-engine executar --plano plano.json [--logs-dir PASTA] [--reter-dias 90]
datahub-engine logs listar [--logs-dir PASTA] [--desde 2026-10-01]
datahub-engine logs limpar [--logs-dir PASTA] [--dias 90]
datahub-engine catalogo --saida ../src/generated/catalogo.json
datahub-engine versao
```

- **Plano** (entrada) e **eventos** (saída): ver [`contrato/EVENTOS.md`](contrato/EVENTOS.md).
- **Ao vivo:** um evento JSON por linha na saída padrão. **Cancelar:** escrever `cancelar` na entrada padrão.
- **Registro:** os mesmos eventos vão para `<logs>/<data>_<hora>_<id>.jsonl`. Pasta padrão:
  `%APPDATA%\DataHub\logs` no Windows. Logs com mais de 90 dias são apagados antes de cada
  execução; execuções em andamento nunca são apagadas.
- **Log legível:** ao lado da saída fica `<saida>_log.txt` (UTF-8 com BOM, para o Bloco de Notas) com
  entradas, etapas, parâmetros, linhas antes → depois, resumo, avisos e status. Também é gravado
  em erro ou cancelamento; o traceback fica só no `.jsonl`. Ver `datahub_engine/relatorio.py`.
- **Códigos de saída:** `0` concluído · `1` erro · `2` plano inválido · `130` cancelado.

## Ferramentas

| Id | O que faz |
|---|---|
| `zebrar-planilha` | cor no cabeçalho e duas cores alternadas nas linhas (só em .xlsx) |
| `eliminar-duplicatas` | valor exatamente igual em todas as colunas-chave (espaço, caixa e acento contam); fica uma linha sorteada por grupo |
| `dicionario` | mantém as linhas em que a coluna contém, ou é igual a, um dos valores (sem caixa e acento) |
| `mesclar-planilhas` | empilha os arquivos (cabeçalho igual, em qualquer ordem) ou põe cada um numa aba |
| `dividir-por` | mantém a aba Consolidada e cria uma aba por valor da coluna; vazios vão para "Outros" |
| `script-python` | roda o script do usuário (`import datahub`, ver `datahub_engine/sdk.py`) |

Cada ferramenta declara seus parâmetros (`FERRAMENTA = Ferramenta(...)`, com `Parametro` em
`ferramentas/base.py`); o motor valida com a mensagem de cada campo antes de executar, e o
comando `catalogo` gera o JSON com ids, rótulos, tipos, opções e padrões para o app montar os
formulários. As regras espelham as do app (`src/domain/ferramentas.ts`). Só a primeira aba de cada arquivo
de entrada é lida (com aviso no log). Números e datas mantêm o tipo original na saída.

## Privacidade

Os eventos **nunca** contêm valores de células, só nomes de arquivo, colunas, parâmetros e
contagens (teste `test_privacidade_*`). O log legível também não mostra os valores do Dicionário,
só a quantidade. A exceção são as mensagens que o **script do usuário**
escreve (`print` ou `datahub.log`), registradas como ele as escreveu.

## Desenvolvimento

```bash
cd engine
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"
.venv/bin/python -m pytest -q
```

Dependências fixadas: `pandas` (as ferramentas trabalham sobre DataFrames), `openpyxl` (xlsx),
`xlrd` (xls antigo); `pytest` para os testes. Cada aba é um DataFrame com dtype `object`, para
que números, datas e vazios mantenham o tipo original; as colunas são acessadas por posição
(nomes de coluna podem repetir).

## Ainda não feito

Empacotamento com PyInstaller e ligação como *sidecar* do Tauri (entrega 3 do plano).
