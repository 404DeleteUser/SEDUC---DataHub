"""Catálogo das ferramentas para o app: o formulário de cada uma é montado a partir daqui.

    python -m datahub_engine catalogo --saida ../src/generated/catalogo.json
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .ferramentas import DESCRICAO_SCRIPT_PYTHON, FERRAMENTAS, NOME_SCRIPT_PYTHON, SCRIPT_PYTHON
from .ferramentas.base import Ferramenta, Parametro

VERSAO_CATALOGO = 1


def _parametro(parametro: Parametro) -> dict[str, Any]:
    return {
        "nome": parametro.nome,
        "rotulo": parametro.rotulo,
        "tipo": parametro.tipo,
        "mensagem": parametro.mensagem,
        "opcoes": [{"valor": valor, "rotulo": rotulo} for valor, rotulo in parametro.opcoes],
        "padrao": parametro.padrao,
        "ajuda": parametro.ajuda,
    }


def _ferramenta(ferramenta: Ferramenta) -> dict[str, Any]:
    return {
        "id": ferramenta.id,
        "nome": ferramenta.nome,
        "descricao": ferramenta.descricao,
        "especial": False,
        "parametros": [_parametro(parametro) for parametro in ferramenta.parametros],
    }


def gerar_catalogo() -> dict[str, Any]:
    script = {
        "id": SCRIPT_PYTHON,
        "nome": NOME_SCRIPT_PYTHON,
        "descricao": DESCRICAO_SCRIPT_PYTHON,
        "especial": True,
        "parametros": [],
    }
    return {"versao": VERSAO_CATALOGO, "ferramentas": [*map(_ferramenta, FERRAMENTAS.values()), script]}


def gravar_catalogo(destino: Path) -> None:
    destino.parent.mkdir(parents=True, exist_ok=True)
    texto = json.dumps(gerar_catalogo(), ensure_ascii=False, indent=2) + "\n"
    destino.write_text(texto, encoding="utf-8", newline="\n")
