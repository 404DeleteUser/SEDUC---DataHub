"""Linha de comando do motor.

    datahub-engine executar --plano plano.json [--logs-dir PASTA] [--reter-dias 90]
    datahub-engine logs listar [--logs-dir PASTA] [--desde 2026-10-01]
    datahub-engine logs limpar [--logs-dir PASTA] [--dias 90]
    datahub-engine catalogo --saida catalogo.json
    datahub-engine versao
"""

from __future__ import annotations

import argparse
import json
import random
import signal
import sys
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path

from . import __version__, registro
from .catalogo import gravar_catalogo
from .eventos import Emissor
from .execucao import Cancelamento, executar_plano
from .plano import PlanoInvalido, carregar_plano

RETENCAO_PADRAO_DIAS = 90
CODIGOS = {"concluido": 0, "concluido_com_avisos": 0, "erro": 1, "cancelado": 130}


def _ouvir_cancelamento(cancelamento: Cancelamento) -> None:
    """O app escreve `cancelar` na entrada padrão para interromper a execução."""

    def ouvir() -> None:
        try:
            for linha in sys.stdin:
                if linha.strip().lower() == "cancelar":
                    cancelamento.pedir()
                    return
        except (OSError, ValueError):
            return

    threading.Thread(target=ouvir, daemon=True).start()
    for sinal in (signal.SIGINT, getattr(signal, "SIGTERM", None)):
        if sinal is not None:
            signal.signal(sinal, lambda *_: cancelamento.pedir())


def _executar(args: argparse.Namespace) -> int:
    try:
        dados = json.loads(Path(args.plano).read_text(encoding="utf-8-sig"))
        plano = carregar_plano(dados)
    except (OSError, json.JSONDecodeError, PlanoInvalido) as erro:
        print(json.dumps({"erro": f"Plano inválido: {erro}"}, ensure_ascii=False), file=sys.stderr)
        return 2

    pasta_logs = Path(args.logs_dir) if args.logs_dir else registro.pasta_de_logs_padrao()
    try:
        registro.limpar(pasta_logs, args.reter_dias)
    except OSError:
        pass  # a retenção nunca impede a execução

    execucao = uuid.uuid4().hex[:12]
    arquivo = pasta_logs / registro.nome_do_arquivo(datetime.now(timezone.utc), execucao)
    registro.marcar_em_andamento(arquivo)
    cancelamento = Cancelamento()
    _ouvir_cancelamento(cancelamento)
    emissor = Emissor(execucao, arquivo)
    try:
        aleatorio = random.Random(args.semente) if args.semente is not None else None
        status = executar_plano(plano, emissor, cancelamento, aleatorio)
    finally:
        emissor.fechar()
        registro.desmarcar(arquivo)
    return CODIGOS[status]


def _logs(args: argparse.Namespace) -> int:
    pasta_logs = Path(args.logs_dir) if args.logs_dir else registro.pasta_de_logs_padrao()
    if args.acao == "listar":
        desde = datetime.fromisoformat(args.desde).replace(tzinfo=timezone.utc) if args.desde else None
        print(json.dumps(registro.listar(pasta_logs, desde), ensure_ascii=False))
    else:
        print(json.dumps({"removidos": registro.limpar(pasta_logs, args.dias)}))
    return 0


def main(argv: list[str] | None = None) -> int:
    for fluxo in (sys.stdout, sys.stderr):
        if hasattr(fluxo, "reconfigure"):
            fluxo.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(prog="datahub-engine")
    comandos = parser.add_subparsers(dest="comando", required=True)

    executar = comandos.add_parser("executar", help="executa um plano")
    executar.add_argument("--plano", required=True)
    executar.add_argument("--logs-dir")
    executar.add_argument("--reter-dias", type=int, default=RETENCAO_PADRAO_DIAS)
    executar.add_argument("--semente", type=int, help=argparse.SUPPRESS)

    logs = comandos.add_parser("logs", help="lista ou limpa o registro de logs")
    logs.add_argument("acao", choices=["listar", "limpar"])
    logs.add_argument("--logs-dir")
    logs.add_argument("--desde")
    logs.add_argument("--dias", type=int, default=RETENCAO_PADRAO_DIAS)

    catalogo = comandos.add_parser("catalogo", help="grava o catálogo de ferramentas (JSON) para o app")
    catalogo.add_argument("--saida", required=True)

    comandos.add_parser("versao", help="mostra a versão")

    args = parser.parse_args(argv)
    if args.comando == "executar":
        return _executar(args)
    if args.comando == "logs":
        return _logs(args)
    if args.comando == "catalogo":
        gravar_catalogo(Path(args.saida))
        return 0
    print(__version__)
    return 0


if __name__ == "__main__":
    sys.exit(main())
