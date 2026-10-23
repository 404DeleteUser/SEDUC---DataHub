"""Ferramentas do DataHub (mesmos ids do app)."""

from . import dicionario, dividir, duplicatas, mesclar, zebrar
from .base import ContextoDaEtapa, ErroDaFerramenta, ResultadoDaEtapa

FERRAMENTAS = {
    "zebrar-planilha": ("Zebrar Planilha", zebrar.executar),
    "eliminar-duplicatas": ("Eliminar Duplicatas", duplicatas.executar),
    "dicionario": ("Dicionário", dicionario.executar),
    "mesclar-planilhas": ("Mesclar Planilhas", mesclar.executar),
    "dividir-por": ("Dividir Por", dividir.executar),
}
SCRIPT_PYTHON = "script-python"
NOME_SCRIPT_PYTHON = "Script Python conectado"

__all__ = ["FERRAMENTAS", "SCRIPT_PYTHON", "NOME_SCRIPT_PYTHON", "ContextoDaEtapa", "ErroDaFerramenta", "ResultadoDaEtapa"]
