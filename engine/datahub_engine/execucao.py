"""Executa um plano etapa por etapa, emitindo os eventos do contrato."""

from __future__ import annotations

import getpass
import platform
import random
import threading
import time
import traceback
from copy import deepcopy
from typing import Any

from .eventos import Emissor
from .ferramentas import (
    FERRAMENTAS,
    NOME_SCRIPT_PYTHON,
    SCRIPT_PYTHON,
    ContextoDaEtapa,
    ErroDaFerramenta,
    ResultadoDaEtapa,
)
from .ferramentas import script as etapa_script
from .pasta import ErroDePlanilha, Pasta, gravar_pasta, ler_planilha
from .plano import Plano

LIMITE_DETALHE = 4000


class Cancelado(Exception):
    """O usuário pediu para cancelar."""


class Cancelamento:
    def __init__(self) -> None:
        self._evento = threading.Event()

    def pedir(self) -> None:
        self._evento.set()

    def verificar(self) -> None:
        if self._evento.is_set():
            raise Cancelado()


def _ms(desde: float) -> int:
    return int((time.monotonic() - desde) * 1000)


def _usuario() -> str:
    try:
        return getpass.getuser()
    except Exception:  # sem variável de ambiente de usuário (ex.: serviço)
        return ""


def _parametros_do_log(etapa) -> dict[str, Any]:
    if etapa.ferramenta == SCRIPT_PYTHON:
        return {"script": etapa.script.get("principal"), "pasta": etapa.script.get("pasta")}
    return etapa.parametros


def executar_plano(
    plano: Plano,
    emissor: Emissor,
    cancelamento: Cancelamento,
    aleatorio: random.Random | None = None,
) -> str:
    """Devolve o status final (o mesmo do evento execucao.fim)."""
    aleatorio = aleatorio or random.Random()
    inicio = time.monotonic()
    unidades = len(plano.entradas) + len(plano.etapas) + 1  # leitura, etapas, gravação
    feitas = 0

    def avancar(mensagem: str, fracao: float = 0.0) -> None:
        percentual = min(99, round((feitas + fracao) / unidades * 100))
        emissor.emitir("progresso", percentual=percentual, mensagem=mensagem)

    emissor.emitir(
        "execucao.inicio",
        nome=plano.nome,
        origem=plano.origem,
        usuario=_usuario(),
        maquina=platform.node(),
        entradas=[{"nome": caminho.name, "caminho": str(caminho)} for caminho in plano.entradas],
        saida={"nome": plano.saida.name, "caminho": str(plano.saida)},
        etapas=[
            {"indice": etapa.indice, "ferramenta": etapa.ferramenta, "parametros": _parametros_do_log(etapa)}
            for etapa in plano.etapas
        ],
    )

    status = "concluido"
    erro: dict[str, Any] | None = None
    etapa_atual: int | None = None
    try:
        entradas = []
        for caminho in plano.entradas:
            cancelamento.verificar()
            avancar(f"Lendo {caminho.name}")
            lido = ler_planilha(caminho)
            entradas.append(lido)
            emissor.emitir(
                "entrada.lida",
                arquivo=caminho.name,
                abas=lido.total_de_abas,
                linhas=len(lido.aba.linhas),
                colunas=len(lido.aba.cabecalho),
            )
            if lido.total_de_abas > 1:
                emissor.emitir(
                    "log",
                    nivel="aviso",
                    mensagem=f"Só a primeira aba de {caminho.name} foi lida (o arquivo tem {lido.total_de_abas}).",
                )
            feitas += 1

        pasta = Pasta([deepcopy(entradas[0].aba)])
        for etapa in plano.etapas:
            cancelamento.verificar()
            etapa_atual = etapa.indice
            nome = NOME_SCRIPT_PYTHON if etapa.ferramenta == SCRIPT_PYTHON else FERRAMENTAS[etapa.ferramenta].nome
            emissor.emitir("etapa.inicio", indice=etapa.indice, ferramenta=etapa.ferramenta, nome=nome)
            avancar(nome)
            comeco = time.monotonic()
            linhas_antes = pasta.linhas
            contexto = ContextoDaEtapa(
                indice=etapa.indice,
                entradas=entradas,
                aleatorio=aleatorio,
                verificar_cancelamento=cancelamento.verificar,
                progresso=lambda mensagem, nome=nome: avancar(f"{nome}: {mensagem}", 0.5),
            )
            if etapa.ferramenta == SCRIPT_PYTHON:
                resultado: ResultadoDaEtapa = etapa_script.executar(
                    pasta,
                    etapa.script or {},
                    contexto,
                    registrar=lambda mensagem, nivel, indice=etapa.indice: emissor.emitir(
                        "log", nivel=nivel, mensagem=mensagem, etapa=indice
                    ),
                    avancar=lambda pct, mensagem: avancar(mensagem or nome, pct / 100),
                )
            else:
                ferramenta = FERRAMENTAS[etapa.ferramenta]
                ferramenta.validar(etapa.parametros)
                resultado = ferramenta.executar(pasta, etapa.parametros, contexto)
            pasta = resultado.pasta
            for aviso in resultado.avisos:
                emissor.emitir("log", nivel="aviso", mensagem=aviso, etapa=etapa.indice)
            emissor.emitir(
                "etapa.fim",
                indice=etapa.indice,
                ferramenta=etapa.ferramenta,
                linhas_antes=linhas_antes,
                linhas_depois=pasta.linhas,
                resumo=resultado.resumo,
                duracao_ms=_ms(comeco),
            )
            feitas += 1
        etapa_atual = None

        cancelamento.verificar()
        avancar(f"Gravando {plano.saida.name}")
        if pasta.zebra and plano.saida.suffix.lower() == ".csv":
            emissor.emitir("log", nivel="aviso", mensagem="CSV não guarda cores: a formatação do Zebrar foi ignorada.")
        gravar_pasta(pasta, plano.saida)
        emissor.emitir("saida.gravada", caminho=str(plano.saida), abas=len(pasta.abas), linhas=pasta.linhas)
        emissor.emitir("progresso", percentual=100, mensagem="Concluído")
        status = "concluido_com_avisos" if emissor.avisos else "concluido"
    except Cancelado:
        status = "cancelado"
    except (ErroDaFerramenta, ErroDePlanilha) as falha:
        status = "erro"
        erro = {"mensagem": str(falha), "etapa": etapa_atual, "detalhe": getattr(falha, "detalhe", None) or None}
    except Exception as falha:  # erro inesperado do motor: registrar e encerrar com status erro
        status = "erro"
        erro = {
            "mensagem": f"Erro inesperado no motor: {falha}",
            "etapa": etapa_atual,
            "detalhe": traceback.format_exc()[-LIMITE_DETALHE:],
        }
    if erro is not None:
        erro = {chave: valor for chave, valor in erro.items() if valor is not None}
    emissor.emitir("execucao.fim", status=status, duracao_ms=_ms(inicio), avisos=emissor.avisos, erro=erro)
    return status
