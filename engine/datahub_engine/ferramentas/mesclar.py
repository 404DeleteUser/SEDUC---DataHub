"""Mesclar Planilhas: empilha os arquivos (mesmo cabeçalho) ou põe cada um numa aba."""

from __future__ import annotations

from typing import Any

import pandas as pd

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
        novas = [Aba(unico(entrada.caminho.stem), entrada.aba.dados.copy(deep=True)) for entrada in contexto.entradas]
        return ResultadoDaEtapa(Pasta(novas, pasta.zebra), {"arquivos_mesclados": len(novas), "abas": len(novas)})

    referencia = abas[0]
    problemas = [
        problema
        for entrada in contexto.entradas[1:]
        if (problema := _divergencias(referencia, entrada.aba, entrada.caminho.name))
    ]
    if problemas:
        raise ErroDaFerramenta("Os cabeçalhos são diferentes. " + " | ".join(problemas))
    quadros = []
    for aba in abas:
        contexto.verificar_cancelamento()
        posicoes: dict[str, list[int]] = {}
        for indice, coluna in enumerate(aba.cabecalho):
            posicoes.setdefault(texto_normalizado(coluna), []).append(indice)
        usados: dict[str, int] = {}
        ordem = []
        for coluna in referencia.cabecalho:
            chave = texto_normalizado(coluna)
            ocorrencia = usados.get(chave, 0)
            ordem.append(posicoes[chave][ocorrencia])
            usados[chave] = ocorrencia + 1
        quadro = aba.dados.iloc[:, ordem].copy(deep=True).reset_index(drop=True)
        quadro.columns = list(referencia.cabecalho)
        quadros.append(quadro)
    dados = pd.concat(quadros, ignore_index=True).astype(object)
    mesclada = referencia.com_dados(dados)
    return ResultadoDaEtapa(Pasta([mesclada], pasta.zebra), {"arquivos_mesclados": len(abas), "linhas": len(dados)})


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
