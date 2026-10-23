"""Dividir Por: mantém a aba consolidada e cria uma aba por valor da coluna.

Valores agrupados sem caixa e acento; células vazias vão para "Outros". O log informa
quantas abas foram criadas, nunca os nomes (que vêm dos valores da planilha).
"""

from __future__ import annotations

from typing import Any

from ..pasta import Aba, Pasta
from ..texto import ABA_CONSOLIDADA, ABA_OUTROS, gerador_de_nomes_unicos, texto_normalizado
from .base import ContextoDaEtapa, ErroDaFerramenta, Ferramenta, Parametro, ResultadoDaEtapa, indice_obrigatorio


def executar(pasta: Pasta, parametros: dict[str, Any], contexto: ContextoDaEtapa) -> ResultadoDaEtapa:
    if len(pasta.abas) != 1:
        raise ErroDaFerramenta(f"Dividir Por precisa de uma aba só, e a planilha tem {len(pasta.abas)}.")
    origem = pasta.abas[0]
    indice = indice_obrigatorio(origem, parametros["coluna"])
    dados = origem.dados.reset_index(drop=True)
    valores = dados.iloc[:, indice]

    grupos: dict[str, list[int]] = {}  # na ordem da primeira aparição
    vazias: list[int] = []
    for posicao, chave in enumerate(valores.map(texto_normalizado)):
        (grupos.setdefault(chave, []) if chave else vazias).append(posicao)

    contexto.verificar_cancelamento()
    unico = gerador_de_nomes_unicos([ABA_CONSOLIDADA])
    abas = [Aba(ABA_CONSOLIDADA, dados.copy())]
    abas += [
        Aba(unico(str(valores.iloc[posicoes[0]]).strip()), dados.iloc[posicoes].reset_index(drop=True))
        for posicoes in grupos.values()
    ]
    if vazias:
        nomes = {texto_normalizado(aba.nome) for aba in abas}
        nome_outros = f"{ABA_OUTROS} (vazios)" if texto_normalizado(ABA_OUTROS) in nomes else ABA_OUTROS
        abas.append(Aba(unico(nome_outros), dados.iloc[vazias].reset_index(drop=True)))
    return ResultadoDaEtapa(
        Pasta(abas, pasta.zebra),
        {"abas_criadas": len(abas) - 1, "linhas_sem_valor": len(vazias)},
    )


FERRAMENTA = Ferramenta(
    id="dividir-por",
    nome="Dividir Por",
    descricao="Mantém a aba consolidada e cria uma aba para cada valor da coluna escolhida.",
    parametros=(Parametro("coluna", "Coluna", "coluna", "Escolha a coluna para dividir."),),
    executar=executar,
)
