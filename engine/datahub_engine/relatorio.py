"""Log legível da execução, gravado ao lado da planilha de saída (`<saida>_log.txt`).

Montado a partir dos mesmos eventos do .jsonl, para quem abre no Bloco de Notas. Só traz
nomes de arquivos e colunas, parâmetros e contagens: nunca valores de células, valores do
dicionário nem o traceback de erros (esse fica só no .jsonl).
"""

from __future__ import annotations

import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any

from .ferramentas import FERRAMENTAS, NOME_SCRIPT_PYTHON, SCRIPT_PYTHON
from .ferramentas.base import Parametro

TITULO = "DataHub - Registro da execução"
NAO_INFORMADO = "Não informado"
ROTULOS_DO_RESUMO = {
    "duplicadas_removidas": "Duplicadas removidas",
    "grupos_com_duplicatas": "Grupos com duplicatas",
    "linhas_mantidas": "Linhas mantidas",
    "linhas_removidas": "Linhas removidas",
    "abas_criadas": "Abas criadas",
    "linhas_sem_valor": "Linhas sem valor (em Outros)",
    "arquivos_mesclados": "Arquivos mesclados",
    "abas": "Total de abas",
    "linhas": "Total de linhas",
    "abas_formatadas": "Abas formatadas",
}
STATUS = {
    "concluido": "Concluído",
    "concluido_com_avisos": "Concluído com avisos",
    "erro": "Erro",
    "cancelado": "Cancelado",
}

Evento = dict[str, Any]


def _do_tipo(eventos: list[Evento], tipo: str) -> list[Evento]:
    return [evento for evento in eventos if evento.get("tipo") == tipo]


def _duracao(ms: int) -> str:
    if ms < 10_000:
        return f"{ms / 1000:.1f} s".replace(".", ",")
    segundos = round(ms / 1000)
    if segundos < 60:
        return f"{segundos} s"
    minutos, resto = divmod(segundos, 60)
    return f"{minutos} min {resto:02d} s"


def _hora_local(ts: Any) -> str:
    try:
        return datetime.fromisoformat(str(ts).replace("Z", "+00:00")).astimezone().strftime("%d/%m/%Y %H:%M:%S")
    except ValueError:
        return NAO_INFORMADO


def _valor_do_parametro(parametro: Parametro, valor: Any) -> str:
    if parametro.tipo == "lista_texto":
        quantidade = sum(1 for item in valor or [] if isinstance(item, str) and item.strip())
        return f"{quantidade} valor(es)"
    if parametro.tipo == "colunas":
        return ", ".join(map(str, valor or []))
    if parametro.tipo == "escolha":
        return dict(parametro.opcoes).get(valor, str(valor))
    if parametro.tipo == "cor":
        return str(valor).upper()
    return str(valor)


def _parametros(etapa: Evento) -> list[str]:
    parametros = etapa.get("parametros") or {}
    if etapa.get("ferramenta") == SCRIPT_PYTHON:
        script = parametros.get("script")
        return [f"Script: {Path(str(script)).name}"] if script else []
    ferramenta = FERRAMENTAS.get(etapa.get("ferramenta"))
    if ferramenta is None:
        return []
    return [
        f"{parametro.rotulo}: {_valor_do_parametro(parametro, parametros[parametro.nome])}"
        for parametro in ferramenta.parametros
        if parametro.nome in parametros
    ]


def _nome_da_etapa(planejada: Evento, iniciada: Evento) -> str:
    if iniciada.get("nome"):
        return iniciada["nome"]
    ferramenta = planejada.get("ferramenta")
    if ferramenta == SCRIPT_PYTHON:
        return NOME_SCRIPT_PYTHON
    return FERRAMENTAS[ferramenta].nome if ferramenta in FERRAMENTAS else str(ferramenta or "Etapa")


def _resultado_da_etapa(fim: Evento) -> list[str]:
    linhas = [f"Linhas: {fim['linhas_antes']} → {fim['linhas_depois']}"]
    for chave, valor in fim.get("resumo", {}).items():
        linhas.append(f"{ROTULOS_DO_RESUMO.get(chave, chave.replace('_', ' ').capitalize())}: {valor}")
    linhas.append(f"Duração: {_duracao(fim['duracao_ms'])}")
    return linhas


def _etapas(eventos: list[Evento]) -> list[str]:
    inicio = next(iter(_do_tipo(eventos, "execucao.inicio")), {})
    planejadas = {etapa.get("indice"): etapa for etapa in inicio.get("etapas", [])}
    iniciadas = {evento["indice"]: evento for evento in _do_tipo(eventos, "etapa.inicio")}
    finais = {evento["indice"]: evento for evento in _do_tipo(eventos, "etapa.fim")}
    linhas = []
    for indice in sorted(set(planejadas) | set(iniciadas)):
        planejada = planejadas.get(indice, {})
        detalhes = _parametros(planejada)
        if indice in finais:
            detalhes += _resultado_da_etapa(finais[indice])
        elif indice not in iniciadas:
            detalhes.append("Não executada.")
        detalhes += [
            f"{log['nivel'].capitalize()}: {log['mensagem']}"
            for log in _do_tipo(eventos, "log")
            if log.get("etapa") == indice
        ]
        linhas.append(f"{indice + 1}. {_nome_da_etapa(planejada, iniciadas.get(indice, {}))}")
        linhas.extend(f"   {detalhe}" for detalhe in detalhes)
    return linhas or ["Nenhuma etapa."]


def _cabecalho(inicio: Evento, fim: Evento) -> list[str]:
    duracao = _duracao(fim["duracao_ms"]) if "duracao_ms" in fim else NAO_INFORMADO
    return [
        TITULO,
        "",
        f"Processo: {inicio.get('nome', NAO_INFORMADO)}",
        f"Origem: {inicio.get('origem', NAO_INFORMADO)}",
        f"Usuário: {inicio.get('usuario') or NAO_INFORMADO}",
        f"Máquina: {inicio.get('maquina') or NAO_INFORMADO}",
        f"Início: {_hora_local(inicio['ts']) if 'ts' in inicio else NAO_INFORMADO}",
        f"Duração total: {duracao}",
    ]


def _entradas(eventos: list[Evento]) -> list[str]:
    linhas = []
    for entrada in _do_tipo(eventos, "entrada.lida"):
        abas = f", {entrada['abas']} abas (só a primeira foi lida)" if entrada["abas"] > 1 else ""
        linhas.append(f"{entrada['arquivo']}: {entrada['linhas']} linhas, {entrada['colunas']} colunas{abas}")
    return linhas or ["Nenhuma entrada lida."]


def _resultado(eventos: list[Evento], fim: Evento) -> list[str]:
    saida = next(iter(_do_tipo(eventos, "saida.gravada")), None)
    linhas = [
        f"Arquivo gravado: {Path(saida['caminho']).name} ({saida['abas']} abas, {saida['linhas']} linhas)"
        if saida
        else "Arquivo gravado: nenhum.",
        f"Status: {STATUS.get(fim.get('status'), 'Interrompido')}",
    ]
    erro = fim.get("erro") or {}
    if erro:
        linhas.append(f"Erro: {erro.get('mensagem', NAO_INFORMADO)}")
        if erro.get("etapa") is not None:
            linhas.append(f"Na etapa: {erro['etapa'] + 1}")
    return linhas


def renderizar(eventos: list[Evento]) -> str:
    """Texto do log legível (aceita execução incompleta: sem fim, sem etapas ou sem entradas)."""
    inicio = next(iter(_do_tipo(eventos, "execucao.inicio")), {})
    fim = next(iter(_do_tipo(eventos, "execucao.fim")), {})
    gerais = [f"{log['nivel'].capitalize()}: {log['mensagem']}" for log in _do_tipo(eventos, "log") if "etapa" not in log]
    secoes = [
        _cabecalho(inicio, fim),
        ["Entradas", *_entradas(eventos)],
        ["Etapas", *_etapas(eventos)],
        ["Avisos gerais", *(gerais or ["Nenhum."])],
        ["Resultado", *_resultado(eventos, fim)],
    ]
    return "\n\n".join("\n".join(secao) for secao in secoes) + "\n"


def caminho_do_relatorio(saida: Path) -> Path:
    return saida.with_name(f"{saida.stem}_log.txt")


def gravar_relatorio(eventos: list[Evento], destino: Path) -> None:
    """UTF-8 com BOM e CRLF (Bloco de Notas); grava num temporário e troca no fim, como gravar_pasta."""
    descritor, temporario = tempfile.mkstemp(dir=destino.parent, prefix=f".{destino.stem}.", suffix=".tmp")
    os.close(descritor)
    try:
        Path(temporario).write_text(renderizar(eventos), encoding="utf-8-sig", newline="\r\n")
        os.replace(temporario, destino)
    except BaseException:
        Path(temporario).unlink(missing_ok=True)
        raise
