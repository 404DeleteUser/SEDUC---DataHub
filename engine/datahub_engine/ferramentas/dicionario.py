"""Dicionário: mantém só as linhas em que a coluna contém (ou é igual a) um dos valores.

Sem diferenciar caixa e acento, como no app.
"""

from __future__ import annotations

from typing import Any

from ..pasta import Pasta
from ..texto import texto_normalizado
from .base import ContextoDaEtapa, ErroDaFerramenta, ResultadoDaEtapa, indice_obrigatorio, texto_obrigatorio


def executar(pasta: Pasta, parametros: dict[str, Any], contexto: ContextoDaEtapa) -> ResultadoDaEtapa:
    coluna = texto_obrigatorio(parametros, "coluna", "Escolha a coluna do dicionário.")
    modo = parametros.get("modo")
    if modo not in {"contem", "exato"}:
        raise ErroDaFerramenta("Escolha se o valor deve estar contido ou ser exato.")
    valores = [texto_normalizado(valor) for valor in parametros.get("valores") or []]
    valores = [valor for valor in valores if valor]
    if not valores:
        raise ErroDaFerramenta("Informe ao menos um valor para manter.")

    def corresponde(celula: Any) -> bool:
        texto = texto_normalizado(celula)
        return any(texto == valor if modo == "exato" else valor in texto for valor in valores)

    antes = pasta.linhas
    for aba in pasta.abas:
        contexto.verificar_cancelamento()
        indice = indice_obrigatorio(aba, coluna)
        aba.linhas = [linha for linha in aba.linhas if corresponde(linha[indice])]
    mantidas = pasta.linhas
    avisos = ["Nenhuma linha corresponde aos valores do dicionário."] if antes and not mantidas else []
    return ResultadoDaEtapa(pasta, {"linhas_mantidas": mantidas, "linhas_removidas": antes - mantidas}, avisos)
