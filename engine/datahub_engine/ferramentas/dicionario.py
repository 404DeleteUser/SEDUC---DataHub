"""Dicionário: mantém só as linhas em que a coluna contém (ou é igual a) um dos valores.

Sem diferenciar caixa e acento, como no app.
"""

from __future__ import annotations

from typing import Any

from ..pasta import Pasta
from ..texto import texto_normalizado
from .base import (
    ContextoDaEtapa,
    Ferramenta,
    Parametro,
    ResultadoDaEtapa,
    indice_obrigatorio,
)


def executar(pasta: Pasta, parametros: dict[str, Any], contexto: ContextoDaEtapa) -> ResultadoDaEtapa:
    """Filtra as abas pelos valores normalizados do dicion\u00e1rio."""
    coluna = parametros["coluna"]
    modo = parametros.get("modo")
    valores = {texto_normalizado(valor) for valor in parametros["valores"]}
    valores.discard("")
    antes = pasta.linhas
    abas = []
    for aba in pasta.abas:
        contexto.verificar_cancelamento()
        indice = indice_obrigatorio(aba, coluna)
        textos = aba.dados.iloc[:, indice].map(texto_normalizado)
        if modo == "exato":
            mascara = textos.isin(valores)
        else:
            mascara = textos.map(lambda texto: any(valor in texto for valor in valores)).astype(bool)
        dados = aba.dados.loc[mascara].reset_index(drop=True)
        abas.append(aba.com_dados(dados))
    saida = Pasta(abas, pasta.zebra)
    mantidas = saida.linhas
    avisos = ["Nenhuma linha corresponde aos valores do dicion\u00e1rio."] if antes and not mantidas else []
    return ResultadoDaEtapa(saida, {"linhas_mantidas": mantidas, "linhas_removidas": antes - mantidas}, avisos)


FERRAMENTA = Ferramenta(
    id="dicionario",
    nome="Dicionário",
    descricao="Mantém só as linhas em que a coluna contém, ou é igual a, um dos valores informados.",
    parametros=(
        Parametro("coluna", "Coluna", "coluna", "Escolha a coluna do dicionário."),
        Parametro(
            "modo",
            "Como comparar",
            "escolha",
            "Escolha se o valor deve estar contido ou ser exato.",
            opcoes=(("contem", "Contém"), ("exato", "Exato")),
            padrao="contem",
        ),
        Parametro(
            "valores",
            "Valores para manter",
            "lista_texto",
            "Informe ao menos um valor para manter.",
            ajuda="Sem diferenciar maiúsculas, minúsculas e acentos.",
        ),
    ),
    executar=executar,
)
