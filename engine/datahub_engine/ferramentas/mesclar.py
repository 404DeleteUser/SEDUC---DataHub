"""Mesclar Planilhas: empilha os arquivos (mesmo cabeçalho) ou põe cada um numa aba."""

from __future__ import annotations

from typing import Any

from ..pasta import Aba, Pasta
from ..texto import gerador_de_nomes_unicos, texto_normalizado
from .base import ContextoDaEtapa, ErroDaFerramenta, Ferramenta, Parametro, ResultadoDaEtapa


def _divergencias(referencia: Aba, outra: Aba, arquivo: str) -> str | None:
    chaves_ref = {texto_normalizado(coluna) for coluna in referencia.cabecalho}
    chaves = {texto_normalizado(coluna) for coluna in outra.cabecalho}
    faltando = [coluna for coluna in referencia.cabecalho if texto_normalizado(coluna) not in chaves]
    sobrando = [coluna for coluna in outra.cabecalho if texto_normalizado(coluna) not in chaves_ref]
    if not faltando and not sobrando:
        return None
    partes = []
    if faltando:
        partes.append(f"faltam {', '.join(faltando)}")
    if sobrando:
        partes.append(f"sobram {', '.join(sobrando)}")
    return f"{arquivo}: {'; '.join(partes)}"


def executar(pasta: Pasta, parametros: dict[str, Any], contexto: ContextoDaEtapa) -> ResultadoDaEtapa:
    modo = parametros.get("modo")
    if modo not in {"vertical", "abas"}:
        raise ErroDaFerramenta("Escolha como mesclar: empilhar linhas ou um arquivo por aba.")
    if len(contexto.entradas) < 2:
        raise ErroDaFerramenta("Mesclar Planilhas precisa de pelo menos dois arquivos de entrada.")
    abas = [entrada.aba for entrada in contexto.entradas]

    if modo == "abas":
        unico = gerador_de_nomes_unicos([])
        novas = [
            Aba.de_linhas(unico(entrada.caminho.stem), list(entrada.aba.cabecalho), [list(l) for l in entrada.aba.linhas])
            for entrada in contexto.entradas
        ]
        return ResultadoDaEtapa(Pasta(novas, pasta.zebra), {"arquivos_mesclados": len(novas), "abas": len(novas)})

    referencia = abas[0]
    problemas = [
        problema
        for entrada in contexto.entradas[1:]
        if (problema := _divergencias(referencia, entrada.aba, entrada.caminho.name))
    ]
    if problemas:
        raise ErroDaFerramenta("Os cabeçalhos são diferentes. " + " | ".join(problemas))
    linhas: list[list[Any]] = []
    for aba in abas:
        contexto.verificar_cancelamento()
        posicoes = {texto_normalizado(coluna): i for i, coluna in enumerate(aba.cabecalho)}
        ordem = [posicoes[texto_normalizado(coluna)] for coluna in referencia.cabecalho]
        linhas.extend([linha[i] for i in ordem] for linha in aba.linhas)
    mesclada = Aba.de_linhas(referencia.nome, list(referencia.cabecalho), linhas)
    return ResultadoDaEtapa(Pasta([mesclada], pasta.zebra), {"arquivos_mesclados": len(abas), "linhas": len(linhas)})


FERRAMENTA = Ferramenta(
    id="mesclar-planilhas",
    nome="Mesclar Planilhas",
    descricao="Empilha planilhas com o mesmo cabeçalho ou junta cada arquivo como uma aba.",
    parametros=(
        Parametro(
            "modo",
            "Como mesclar",
            "escolha",
            "Escolha como mesclar: empilhar linhas ou um arquivo por aba.",
            opcoes=(("vertical", "Empilhar linhas"), ("abas", "Um arquivo por aba")),
            padrao="vertical",
        ),
    ),
    executar=executar,
)
