"""Tipos comuns às ferramentas: contexto da etapa, resultado e erro explicado."""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Any, Callable

from ..pasta import Aba, ArquivoLido, Pasta


class ErroDaFerramenta(Exception):
    """Erro que o usuário entende e consegue corrigir (vai para o log como está)."""


@dataclass
class ContextoDaEtapa:
    indice: int
    entradas: list[ArquivoLido]
    aleatorio: random.Random
    verificar_cancelamento: Callable[[], None]
    progresso: Callable[[str], None] = lambda mensagem: None


@dataclass
class ResultadoDaEtapa:
    pasta: Pasta
    resumo: dict[str, int]
    avisos: list[str] = field(default_factory=list)


def indice_obrigatorio(aba: Aba, coluna: str) -> int:
    indice = aba.indice_da_coluna(coluna)
    if indice is None:
        raise ErroDaFerramenta(f"A coluna {coluna} não existe na aba {aba.nome}.")
    return indice


def texto_obrigatorio(parametros: dict[str, Any], campo: str, mensagem: str) -> str:
    valor = parametros.get(campo)
    if not isinstance(valor, str) or not valor.strip():
        raise ErroDaFerramenta(mensagem)
    return valor
