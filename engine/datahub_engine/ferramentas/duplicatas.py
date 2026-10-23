"""Eliminar Duplicatas: linhas com valor exatamente igual em todas as colunas-chave.

Espaço, caixa e acento contam. De cada grupo fica uma linha sorteada, na posição original.
"""

from __future__ import annotations

from typing import Any

from ..pasta import Pasta
from .base import ContextoDaEtapa, ErroDaFerramenta, Ferramenta, Parametro, ResultadoDaEtapa, indice_obrigatorio


def executar(pasta: Pasta, parametros: dict[str, Any], contexto: ContextoDaEtapa) -> ResultadoDaEtapa:
    colunas = parametros.get("colunasChave")
    if not isinstance(colunas, list) or not colunas:
        raise ErroDaFerramenta("Escolha ao menos uma coluna para identificar as duplicatas.")
    removidas = 0
    grupos_com_duplicatas = 0
    for aba in pasta.abas:
        contexto.verificar_cancelamento()
        indices = [indice_obrigatorio(aba, coluna) for coluna in colunas]
        grupos: dict[tuple, list[int]] = {}
        for posicao, linha in enumerate(aba.linhas):
            chave = tuple((type(linha[i]).__name__, linha[i]) for i in indices)
            grupos.setdefault(chave, []).append(posicao)
        mantidas = set()
        for posicoes in grupos.values():
            if len(posicoes) > 1:
                grupos_com_duplicatas += 1
            mantidas.add(contexto.aleatorio.choice(posicoes))
        removidas += len(aba.linhas) - len(mantidas)
        aba.linhas = [linha for posicao, linha in enumerate(aba.linhas) if posicao in mantidas]
    contexto.progresso(f"Comparando linhas pelas colunas: {', '.join(colunas)}")
    return ResultadoDaEtapa(
        pasta,
        {"duplicadas_removidas": removidas, "grupos_com_duplicatas": grupos_com_duplicatas},
    )


FERRAMENTA = Ferramenta(
    id="eliminar-duplicatas",
    nome="Eliminar Duplicatas",
    descricao="Remove linhas repetidas considerando as colunas escolhidas como chave.",
    parametros=(
        Parametro(
            "colunasChave",
            "Colunas-chave",
            "colunas",
            "Escolha ao menos uma coluna para identificar as duplicatas.",
            ajuda="Linhas com os mesmos valores nessas colunas são duplicatas; uma delas é mantida.",
        ),
    ),
    executar=executar,
)
