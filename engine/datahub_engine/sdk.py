"""API para scripts Python conectados a um processo (`import datahub`).

    import datahub
    ctx = datahub.contexto()          # entrada da etapa, onde gravar a saída, entradas originais
    datahub.log("Lendo a planilha")   # vira um evento de log da execução
    datahub.progresso(50, "Metade")   # progresso desta etapa (0–100)

O script lê `ctx["entrada"]` (a planilha como está nesta etapa, em .xlsx) e grava o resultado
em `ctx["saida"]` (.xlsx, primeira aba). Se não gravar, a planilha segue sem alteração.
A aba resultante mantém o nome da aba que entrou na etapa.
"""

from __future__ import annotations

from typing import Any, Callable

_estado: dict[str, Any] = {}


def _configurar(
    contexto: dict[str, Any],
    registrar: Callable[[str, str], None],
    avancar: Callable[[int, str], None],
) -> None:
    _estado.clear()
    _estado.update(contexto=dict(contexto), registrar=registrar, avancar=avancar)


def contexto() -> dict[str, Any]:
    if "contexto" not in _estado:
        raise RuntimeError("datahub.contexto() só funciona com o script executado pelo DataHub.")
    return dict(_estado["contexto"])


def log(mensagem: str, nivel: str = "info") -> None:
    if nivel not in {"info", "aviso"}:
        raise ValueError("nivel deve ser 'info' ou 'aviso'")
    if "registrar" in _estado:
        _estado["registrar"](str(mensagem), nivel)


def progresso(percentual: int, mensagem: str = "") -> None:
    if "avancar" in _estado:
        _estado["avancar"](max(0, min(100, int(percentual))), str(mensagem))
