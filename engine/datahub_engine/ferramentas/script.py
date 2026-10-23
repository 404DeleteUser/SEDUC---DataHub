"""Script Python do usuário como etapa: roda no mesmo processo do motor (embutido no app).

A planilha atual vai para um .xlsx temporário; o script grava o resultado em outro .xlsx,
que o motor lê de volta. O que o script imprimir vira log "info".
"""

from __future__ import annotations

import contextlib
from dataclasses import replace
import io
import runpy
import sys
import tempfile
import traceback
from pathlib import Path
from typing import Any, Callable

from .. import sdk
from ..pasta import ErroDePlanilha, Pasta, gravar_pasta, ler_planilha
from .base import ContextoDaEtapa, ErroDaFerramenta, ResultadoDaEtapa


class _SaidaParaLog(io.TextIOBase):
    """Cada linha impressa pelo script vira um log."""

    def __init__(self, registrar: Callable[[str, str], None]) -> None:
        self._registrar = registrar
        self._pendente = ""

    def write(self, texto: str) -> int:
        self._pendente += texto
        *linhas, self._pendente = self._pendente.split("\n")
        for linha in linhas:
            if linha.strip():
                self._registrar(linha.rstrip(), "info")
        return len(texto)

    def flush(self) -> None:
        if self._pendente.strip():
            self._registrar(self._pendente.rstrip(), "info")
        self._pendente = ""


class ErroDoScript(ErroDaFerramenta):
    def __init__(self, mensagem: str, detalhe: str) -> None:
        super().__init__(mensagem)
        self.detalhe = detalhe


def executar(
    pasta: Pasta,
    script: dict[str, Any],
    contexto: ContextoDaEtapa,
    registrar: Callable[[str, str], None],
    avancar: Callable[[int, str], None],
) -> ResultadoDaEtapa:
    principal = Path(str(script.get("principal") or ""))
    if not principal.is_file() or principal.suffix.lower() != ".py":
        raise ErroDaFerramenta(f"Script Python não encontrado: {principal}")
    pasta_do_script = Path(str(script["pasta"])) if script.get("pasta") else principal.parent

    with tempfile.TemporaryDirectory(prefix="datahub-") as temporaria:
        entrada = Path(temporaria) / "entrada.xlsx"
        saida = Path(temporaria) / "saida.xlsx"
        gravar_pasta(Pasta(pasta.abas), entrada)
        sdk._configurar(
            {
                "entrada": str(entrada),
                "saida": str(saida),
                "entradas_originais": [str(item.caminho) for item in contexto.entradas],
                "pasta_do_script": str(pasta_do_script),
            },
            registrar,
            avancar,
        )
        sys.modules["datahub"] = sdk
        sys.path.insert(0, str(pasta_do_script))
        saida_do_script = _SaidaParaLog(registrar)
        try:
            with contextlib.redirect_stdout(saida_do_script):
                runpy.run_path(str(principal), run_name="__main__")
        except SystemExit as fim:
            if fim.code not in (None, 0):
                raise ErroDoScript(f"O script {principal.name} terminou com código {fim.code}.", "") from None
        except Exception as erro:  # o script é do usuário: qualquer falha vira erro da etapa
            detalhe = "".join(traceback.format_exception(erro)[-6:])
            raise ErroDoScript(f"O script {principal.name} falhou: {erro}", detalhe) from None
        finally:
            saida_do_script.flush()
            sys.path.remove(str(pasta_do_script))

        if not saida.is_file():
            return ResultadoDaEtapa(pasta, {"abas": len(pasta.abas)}, ["O script não gravou saída; a planilha seguiu sem alteração."])
        try:
            resultado = ler_planilha(saida)
        except ErroDePlanilha as erro:
            raise ErroDaFerramenta(f"A saída do script é inválida: {erro}") from None
        if len(pasta.abas) == 1:
            resultado_aba = replace(resultado.aba, nome=pasta.abas[0].nome)  # o script não precisa se preocupar com o nome da aba
        else:
            resultado_aba = resultado.aba
        nova = Pasta([resultado_aba], pasta.zebra)
        return ResultadoDaEtapa(nova, {"abas": len(nova.abas)})
