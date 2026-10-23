"""Registro de logs: um arquivo .jsonl por execução, listagem e retenção.

Uma execução em andamento tem, ao lado do log, um marcador `.em-andamento` com o PID do
motor. Sem `execucao.fim` e sem processo vivo, a execução foi interrompida.
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

EXTENSAO = ".jsonl"
MARCADOR = ".em-andamento"


def pasta_de_logs_padrao() -> Path:
    if sys.platform == "win32":
        base = Path(os.environ.get("APPDATA") or Path.home() / "AppData" / "Roaming")
    else:
        base = Path(os.environ.get("XDG_DATA_HOME") or Path.home() / ".local" / "share")
    return base / "DataHub" / "logs"


def nome_do_arquivo(inicio: datetime, execucao: str) -> str:
    return f"{inicio.astimezone().strftime('%Y-%m-%d_%H%M%S')}_{execucao}{EXTENSAO}"


def marcador_de(arquivo: Path) -> Path:
    return arquivo.with_suffix(MARCADOR)


def marcar_em_andamento(arquivo: Path) -> None:
    arquivo.parent.mkdir(parents=True, exist_ok=True)
    marcador_de(arquivo).write_text(str(os.getpid()), encoding="utf-8")


def desmarcar(arquivo: Path) -> None:
    marcador_de(arquivo).unlink(missing_ok=True)


def processo_ativo(pid: int) -> bool:
    if pid <= 0:
        return False
    if sys.platform == "win32":
        import ctypes

        acesso = 0x1000  # PROCESS_QUERY_LIMITED_INFORMATION
        alca = ctypes.windll.kernel32.OpenProcess(acesso, False, pid)
        if not alca:
            return False
        codigo = ctypes.c_ulong()
        ctypes.windll.kernel32.GetExitCodeProcess(alca, ctypes.byref(codigo))
        ctypes.windll.kernel32.CloseHandle(alca)
        return codigo.value == 259  # STILL_ACTIVE
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    return True


def _em_andamento(arquivo: Path) -> bool:
    marcador = marcador_de(arquivo)
    try:
        return processo_ativo(int(marcador.read_text(encoding="utf-8").strip()))
    except (OSError, ValueError):
        return False


def _eventos(arquivo: Path) -> list[dict[str, Any]]:
    eventos = []
    with arquivo.open(encoding="utf-8") as conteudo:
        for linha in conteudo:
            try:
                eventos.append(json.loads(linha))
            except json.JSONDecodeError:
                continue  # última linha cortada por uma interrupção
    return eventos


def resumo_do_arquivo(arquivo: Path) -> dict[str, Any] | None:
    eventos = _eventos(arquivo)
    inicio = next((e for e in eventos if e.get("tipo") == "execucao.inicio"), None)
    if inicio is None:
        return None
    fim = next((e for e in reversed(eventos) if e.get("tipo") == "execucao.fim"), None)
    if fim is not None:
        status = fim["status"]
    else:
        status = "em_andamento" if _em_andamento(arquivo) else "interrompido"
    return {
        "execucao": inicio["execucao"],
        "arquivo": str(arquivo),
        "nome": inicio["nome"],
        "origem": inicio["origem"],
        "usuario": inicio["usuario"],
        "inicio": inicio["ts"],
        "fim": fim["ts"] if fim else None,
        "status": status,
        "duracao_ms": fim["duracao_ms"] if fim else None,
        "avisos": sum(1 for e in eventos if e.get("tipo") == "log" and e.get("nivel") == "aviso"),
        "etapas": len(inicio["etapas"]),
        "saida": inicio["saida"]["caminho"],
        "erro": (fim.get("erro") or {}).get("mensagem") if fim else None,
    }


def _data_do_inicio(resumo: dict[str, Any]) -> datetime:
    return datetime.strptime(resumo["inicio"], "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=timezone.utc)


def listar(pasta: Path, desde: datetime | None = None) -> list[dict[str, Any]]:
    """Execuções da mais recente para a mais antiga."""
    if not pasta.is_dir():
        return []
    resumos = []
    for arquivo in pasta.glob(f"*{EXTENSAO}"):
        resumo = resumo_do_arquivo(arquivo)
        if resumo and (desde is None or _data_do_inicio(resumo) >= desde):
            resumos.append(resumo)
    return sorted(resumos, key=lambda resumo: resumo["inicio"], reverse=True)


def limpar(pasta: Path, dias: int, agora: datetime | None = None) -> int:
    """Apaga logs com mais de `dias`; execuções em andamento nunca são apagadas."""
    if not pasta.is_dir():
        return 0
    limite = (agora or datetime.now(timezone.utc)) - timedelta(days=dias)
    removidos = 0
    for arquivo in pasta.glob(f"*{EXTENSAO}"):
        resumo = resumo_do_arquivo(arquivo)
        if resumo is None or resumo["status"] == "em_andamento":
            continue
        if _data_do_inicio(resumo) < limite:
            arquivo.unlink(missing_ok=True)
            desmarcar(arquivo)
            removidos += 1
    return removidos
