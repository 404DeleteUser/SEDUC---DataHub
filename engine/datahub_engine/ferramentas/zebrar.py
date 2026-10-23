"""Zebrar Planilha: cor no cabeçalho e duas cores alternadas nas linhas (aplicadas ao gravar)."""

from __future__ import annotations

from dataclasses import replace
from typing import Any

from ..pasta import Pasta, Zebra
from .base import ContextoDaEtapa, Ferramenta, Parametro, ResultadoDaEtapa

_CAMPOS = {
    "corCabecalho": "do cabeçalho",
    "corLinhaA": "das linhas ímpares",
    "corLinhaB": "das linhas pares",
}


def executar(pasta: Pasta, parametros: dict[str, Any], contexto: ContextoDaEtapa) -> ResultadoDaEtapa:
    nova = replace(pasta, zebra=Zebra(parametros["corCabecalho"], parametros["corLinhaA"], parametros["corLinhaB"]))
    return ResultadoDaEtapa(nova, {"abas_formatadas": len(nova.abas)})


FERRAMENTA = Ferramenta(
    id="zebrar-planilha",
    nome="Zebrar Planilha",
    descricao="Pinta o cabeçalho e alterna duas cores nas linhas para facilitar a leitura.",
    parametros=tuple(
        Parametro(campo, f"Cor {rotulo}", "cor", f"A cor {rotulo} é inválida (use o formato #RRGGBB).", padrao=padrao)
        for (campo, rotulo), padrao in zip(_CAMPOS.items(), ("#1f4e79", "#ffffff", "#e8effc"))
    ),
    executar=executar,
)
