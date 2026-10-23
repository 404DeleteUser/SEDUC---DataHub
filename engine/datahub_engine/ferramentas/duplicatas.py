"""Eliminar Duplicatas: linhas com valor exatamente igual em todas as colunas-chave.

Espaço, caixa, acento e tipo contam (1 ≠ "1"). De cada grupo fica uma linha sorteada, na posição original.
"""

from __future__ import annotations

from typing import Any

from ..pasta import Pasta
from .base import ContextoDaEtapa, Ferramenta, Parametro, ResultadoDaEtapa, indice_obrigatorio


def executar(pasta: Pasta, parametros: dict[str, Any], contexto: ContextoDaEtapa) -> ResultadoDaEtapa:
    colunas = parametros["colunasChave"]
    removidas = 0
    grupos_com_duplicatas = 0
    abas = []
    for aba in pasta.abas:
        contexto.verificar_cancelamento()
        indices = [indice_obrigatorio(aba, coluna) for coluna in colunas]
        grupos: dict[tuple, list[int]] = {}
        chaves = aba.dados.iloc[:, indices].itertuples(index=False, name=None)
        for posicao, valores in enumerate(chaves):
            chave = tuple((type(valor).__name__, valor) for valor in valores)
            grupos.setdefault(chave, []).append(posicao)
        mantidas = []
        for posicoes in grupos.values():
            if len(posicoes) > 1:
                grupos_com_duplicatas += 1
            mantidas.append(contexto.aleatorio.choice(posicoes))
        mantidas.sort()
        removidas += len(aba.dados) - len(mantidas)
        dados = aba.dados.iloc[mantidas].reset_index(drop=True)
        abas.append(aba.com_dados(dados))
    contexto.progresso(f"Comparando linhas pelas colunas: {', '.join(colunas)}")
    return ResultadoDaEtapa(
        Pasta(abas, pasta.zebra),
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
