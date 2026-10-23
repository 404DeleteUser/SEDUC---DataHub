"""Dividir Por: mantém a aba consolidada e cria uma aba por valor da coluna.

Valores agrupados sem caixa e acento; células vazias vão para "Outros". O log informa
quantas abas foram criadas, nunca os nomes (que vêm dos valores da planilha).
"""

from __future__ import annotations

from typing import Any

from ..pasta import Aba, Pasta
from ..texto import ABA_CONSOLIDADA, ABA_OUTROS, gerador_de_nomes_unicos, texto_normalizado
from .base import (
    ContextoDaEtapa,
    ErroDaFerramenta,
    Ferramenta,
    Parametro,
    ResultadoDaEtapa,
    indice_obrigatorio,
    texto_obrigatorio,
)


def executar(pasta: Pasta, parametros: dict[str, Any], contexto: ContextoDaEtapa) -> ResultadoDaEtapa:
    coluna = texto_obrigatorio(parametros, "coluna", "Escolha a coluna para dividir.")
    if len(pasta.abas) != 1:
        raise ErroDaFerramenta(f"Dividir Por precisa de uma aba só, e a planilha tem {len(pasta.abas)}.")
    origem = pasta.abas[0]
    indice = indice_obrigatorio(origem, coluna)

    grupos: dict[str, tuple[str, list[list[Any]]]] = {}
    vazias: list[list[Any]] = []
    for linha in origem.linhas:
        chave = texto_normalizado(linha[indice])
        if not chave:
            vazias.append(linha)
            continue
        if chave not in grupos:
            grupos[chave] = (str(linha[indice]).strip(), [])
        grupos[chave][1].append(linha)

    contexto.verificar_cancelamento()
    unico = gerador_de_nomes_unicos([ABA_CONSOLIDADA])
    abas = [Aba.de_linhas(ABA_CONSOLIDADA, list(origem.cabecalho), list(origem.linhas))]
    abas += [Aba.de_linhas(unico(nome), list(origem.cabecalho), linhas) for nome, linhas in grupos.values()]
    if vazias:
        nomes = {texto_normalizado(aba.nome) for aba in abas}
        nome_outros = f"{ABA_OUTROS} (vazios)" if texto_normalizado(ABA_OUTROS) in nomes else ABA_OUTROS
        abas.append(Aba.de_linhas(unico(nome_outros), list(origem.cabecalho), vazias))
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
