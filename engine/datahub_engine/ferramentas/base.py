"""Tipos comuns às ferramentas: declaração (catálogo), contexto da etapa, resultado e erro explicado."""

from __future__ import annotations

import random
import re
from dataclasses import dataclass, field
from typing import Any, Callable, Literal

from ..pasta import Aba, ArquivoLido, Pasta

TipoDeParametro = Literal["coluna", "colunas", "escolha", "lista_texto", "cor"]
_COR = re.compile(r"^#[0-9a-fA-F]{6}$")


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


def _texto_preenchido(valor: Any) -> bool:
    return isinstance(valor, str) and bool(valor.strip())


_VALIDOS: dict[str, Callable[[Any, "Parametro"], bool]] = {
    "coluna": lambda valor, _: _texto_preenchido(valor),
    "colunas": lambda valor, _: isinstance(valor, list) and bool(valor) and all(_texto_preenchido(v) for v in valor),
    "escolha": lambda valor, parametro: valor in {opcao for opcao, _ in parametro.opcoes},
    "lista_texto": lambda valor, _: isinstance(valor, list) and any(_texto_preenchido(v) for v in valor),
    "cor": lambda valor, _: isinstance(valor, str) and bool(_COR.match(valor)),
}


@dataclass(frozen=True)
class Parametro:
    """Um campo do formulário da ferramenta; `mensagem` é o erro mostrado se o valor for inválido."""

    nome: str
    rotulo: str
    tipo: TipoDeParametro
    mensagem: str
    opcoes: tuple[tuple[str, str], ...] = ()  # (valor, rótulo)
    padrao: Any = None
    ajuda: str = ""

    def valido(self, valor: Any) -> bool:
        return _VALIDOS[self.tipo](valor, self)


Executar = Callable[[Pasta, dict[str, Any], ContextoDaEtapa], ResultadoDaEtapa]


@dataclass(frozen=True)
class Ferramenta:
    id: str
    nome: str
    descricao: str
    parametros: tuple[Parametro, ...]
    executar: Executar

    def validar(self, parametros: dict[str, Any]) -> None:
        """Confere os parâmetros declarados, na ordem; o primeiro inválido vira ErroDaFerramenta."""
        for parametro in self.parametros:
            if not parametro.valido(parametros.get(parametro.nome)):
                raise ErroDaFerramenta(parametro.mensagem)


def indice_obrigatorio(aba: Aba, coluna: str) -> int:
    indice = aba.indice_da_coluna(coluna)
    if indice is None:
        raise ErroDaFerramenta(f"A coluna {coluna} não existe na aba {aba.nome}.")
    return indice
