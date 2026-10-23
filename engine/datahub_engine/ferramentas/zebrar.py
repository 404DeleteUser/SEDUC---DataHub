"""Zebrar Planilha: cor no cabeçalho e duas cores alternadas nas linhas (aplicadas ao gravar)."""

from __future__ import annotations

import re
from typing import Any

from ..pasta import Pasta, Zebra
from .base import ContextoDaEtapa, ErroDaFerramenta, ResultadoDaEtapa

_COR = re.compile(r"^#[0-9a-fA-F]{6}$")
_CAMPOS = {
    "corCabecalho": "do cabeçalho",
    "corLinhaA": "das linhas ímpares",
    "corLinhaB": "das linhas pares",
}


def executar(pasta: Pasta, parametros: dict[str, Any], contexto: ContextoDaEtapa) -> ResultadoDaEtapa:
    for campo, rotulo in _CAMPOS.items():
        if not isinstance(parametros.get(campo), str) or not _COR.match(parametros[campo]):
            raise ErroDaFerramenta(f"A cor {rotulo} é inválida (use o formato #RRGGBB).")
    pasta.zebra = Zebra(parametros["corCabecalho"], parametros["corLinhaA"], parametros["corLinhaB"])
    return ResultadoDaEtapa(pasta, {"abas_formatadas": len(pasta.abas)})
