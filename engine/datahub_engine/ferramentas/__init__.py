"""Ferramentas do DataHub (mesmos ids do app), cada uma declarada com seus parâmetros."""

from . import dicionario, dividir, duplicatas, mesclar, zebrar
from .base import ContextoDaEtapa, ErroDaFerramenta, Ferramenta, Parametro, ResultadoDaEtapa

FERRAMENTAS: dict[str, Ferramenta] = {
    modulo.FERRAMENTA.id: modulo.FERRAMENTA for modulo in (zebrar, duplicatas, dicionario, mesclar, dividir)
}
SCRIPT_PYTHON = "script-python"
NOME_SCRIPT_PYTHON = "Script Python conectado"
DESCRICAO_SCRIPT_PYTHON = "Script existente conectado ao fluxo do processo."

__all__ = [
    "FERRAMENTAS",
    "SCRIPT_PYTHON",
    "NOME_SCRIPT_PYTHON",
    "DESCRICAO_SCRIPT_PYTHON",
    "ContextoDaEtapa",
    "ErroDaFerramenta",
    "Ferramenta",
    "Parametro",
    "ResultadoDaEtapa",
]
