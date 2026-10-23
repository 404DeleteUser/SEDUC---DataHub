"""Plano de execução recebido do app (ver contrato/EVENTOS.md)."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .ferramentas import FERRAMENTAS, SCRIPT_PYTHON
from .pasta import EXTENSOES_DE_SAIDA


class PlanoInvalido(ValueError):
    """O plano não pode ser executado (código de saída 2)."""


@dataclass
class EtapaDoPlano:
    indice: int
    ferramenta: str
    parametros: dict[str, Any] = field(default_factory=dict)
    script: dict[str, Any] | None = None


@dataclass
class Plano:
    nome: str
    origem: str
    entradas: list[Path]
    saida: Path
    etapas: list[EtapaDoPlano]


def _caminho(valor: Any, descricao: str) -> Path:
    if not isinstance(valor, dict) or not isinstance(valor.get("caminho"), str) or not valor["caminho"].strip():
        raise PlanoInvalido(f"{descricao} sem caminho.")
    return Path(valor["caminho"])


def carregar_plano(dados: Any) -> Plano:
    if not isinstance(dados, dict) or dados.get("versao") != 1:
        raise PlanoInvalido("Plano em formato desconhecido (versão esperada: 1).")
    nome = dados.get("nome")
    if not isinstance(nome, str) or not nome.strip():
        raise PlanoInvalido("O plano precisa de um nome.")
    origem = dados.get("origem")
    if origem not in {"processo", "ferramenta"}:
        raise PlanoInvalido("Origem do plano inválida (processo ou ferramenta).")
    entradas = dados.get("entradas")
    if not isinstance(entradas, list) or not entradas:
        raise PlanoInvalido("Informe ao menos a planilha principal.")
    saida = _caminho(dados.get("saida"), "Saída")
    if saida.suffix.lower() not in EXTENSOES_DE_SAIDA:
        raise PlanoInvalido(f"Formato de saída não suportado: {saida.name} (use .xlsx ou .csv).")

    etapas = []
    for indice, etapa in enumerate(dados.get("etapas") or []):
        if not isinstance(etapa, dict):
            raise PlanoInvalido(f"Etapa {indice + 1} inválida.")
        ferramenta = etapa.get("ferramenta")
        if ferramenta == SCRIPT_PYTHON:
            script = etapa.get("script")
            if not isinstance(script, dict) or not isinstance(script.get("principal"), str):
                raise PlanoInvalido(f"Etapa {indice + 1}: informe o script principal.")
            etapas.append(EtapaDoPlano(indice, ferramenta, {}, script))
            continue
        if ferramenta not in FERRAMENTAS:
            raise PlanoInvalido(f"Etapa {indice + 1}: ferramenta desconhecida ({ferramenta}).")
        parametros = etapa.get("parametros") or {}
        if not isinstance(parametros, dict):
            raise PlanoInvalido(f"Etapa {indice + 1}: parâmetros inválidos.")
        etapas.append(EtapaDoPlano(indice, ferramenta, parametros))

    return Plano(
        nome=nome.strip(),
        origem=origem,
        entradas=[_caminho(entrada, f"Entrada {numero}") for numero, entrada in enumerate(entradas, 1)],
        saida=saida,
        etapas=etapas,
    )
