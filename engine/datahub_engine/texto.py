"""Regras de texto compartilhadas com o app (src/domain/ferramentas.ts)."""

from __future__ import annotations

import re
import unicodedata
from typing import Any, Callable

LIMITE_NOME_ABA = 31
ABA_CONSOLIDADA = "Consolidada"
ABA_OUTROS = "Outros"


def texto_normalizado(valor: Any) -> str:
    """Sem diferenciar caixa, acentos e espaços nas pontas (igual a textoNormalizado)."""
    texto = "" if valor is None else str(valor)
    sem_acento = "".join(
        caractere
        for caractere in unicodedata.normalize("NFD", texto)
        if not unicodedata.combining(caractere)
    )
    return sem_acento.lower().strip()


def nome_de_aba(texto: str) -> str:
    """Nome aceito pelo Excel: sem []:*?/\\ e com no máximo 31 caracteres."""
    limpo = re.sub(r"[\[\]:*?/\\]", " ", texto)
    limpo = re.sub(r"\s+", " ", limpo).strip()[:LIMITE_NOME_ABA].strip()
    return limpo or "Sem nome"


def gerador_de_nomes_unicos(reservados: list[str]) -> Callable[[str], str]:
    """Devolve nomes de aba únicos (sem caixa e acento), com sufixo " (2)", " (3)"…"""
    usados = {texto_normalizado(nome) for nome in reservados}

    def unico(nome: str) -> str:
        base = nome_de_aba(nome)
        candidato = base
        numero = 2
        while texto_normalizado(candidato) in usados:
            sufixo = f" ({numero})"
            candidato = f"{base[: LIMITE_NOME_ABA - len(sufixo)]}{sufixo}"
            numero += 1
        usados.add(texto_normalizado(candidato))
        return candidato

    return unico
