"""Eventos da execução (contrato v1, ver contrato/EVENTOS.md).

O Emissor numera os eventos, carimba a hora e os envia, na mesma ordem, para a
saída padrão (o app acompanha ao vivo) e para o arquivo de log da execução.
"""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, TextIO

VERSAO = 1

TIPOS = {
    "execucao.inicio",
    "entrada.lida",
    "etapa.inicio",
    "progresso",
    "log",
    "etapa.fim",
    "saida.gravada",
    "execucao.fim",
}
STATUS_FINAIS = {"concluido", "concluido_com_avisos", "erro", "cancelado"}
NIVEIS_DE_LOG = {"info", "aviso"}
_TS = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$")


class EventoInvalido(ValueError):
    """O evento não segue o contrato."""


def _exigir(condicao: bool, mensagem: str) -> None:
    if not condicao:
        raise EventoInvalido(mensagem)


def _inteiro(valor: Any, minimo: int = 0) -> bool:
    return isinstance(valor, int) and not isinstance(valor, bool) and valor >= minimo


def _texto(valor: Any) -> bool:
    return isinstance(valor, str) and bool(valor)


def _arquivo(valor: Any) -> bool:
    return isinstance(valor, dict) and _texto(valor.get("nome")) and _texto(valor.get("caminho"))


def validar_evento(evento: dict[str, Any]) -> None:
    """Levanta EventoInvalido se o evento não seguir o contrato."""
    _exigir(isinstance(evento, dict), "evento não é um objeto")
    _exigir(evento.get("v") == VERSAO, "versão do contrato inválida")
    _exigir(_texto(evento.get("execucao")), "execucao ausente")
    _exigir(_inteiro(evento.get("seq"), 1), "seq deve ser inteiro ≥ 1")
    _exigir(isinstance(evento.get("ts"), str) and bool(_TS.match(evento["ts"])), "ts inválido")
    tipo = evento.get("tipo")
    _exigir(tipo in TIPOS, f"tipo desconhecido: {tipo}")

    if tipo == "execucao.inicio":
        _exigir(_texto(evento.get("nome")), "nome ausente")
        _exigir(evento.get("origem") in {"processo", "ferramenta"}, "origem inválida")
        _exigir(isinstance(evento.get("usuario"), str), "usuario ausente")
        _exigir(isinstance(evento.get("maquina"), str), "maquina ausente")
        entradas = evento.get("entradas")
        _exigir(isinstance(entradas, list) and all(map(_arquivo, entradas)), "entradas inválidas")
        _exigir(_arquivo(evento.get("saida")), "saida inválida")
        etapas = evento.get("etapas")
        _exigir(isinstance(etapas, list), "etapas inválidas")
        for etapa in etapas:
            _exigir(
                isinstance(etapa, dict)
                and _inteiro(etapa.get("indice"))
                and _texto(etapa.get("ferramenta"))
                and isinstance(etapa.get("parametros"), dict),
                "etapa inválida",
            )
    elif tipo == "entrada.lida":
        _exigir(_texto(evento.get("arquivo")), "arquivo ausente")
        for campo in ("abas", "linhas", "colunas"):
            _exigir(_inteiro(evento.get(campo)), f"{campo} inválido")
    elif tipo == "etapa.inicio":
        _exigir(_inteiro(evento.get("indice")), "indice inválido")
        _exigir(_texto(evento.get("ferramenta")), "ferramenta ausente")
        _exigir(_texto(evento.get("nome")), "nome ausente")
    elif tipo == "progresso":
        percentual = evento.get("percentual")
        _exigir(_inteiro(percentual) and percentual <= 100, "percentual fora de 0–100")
        _exigir(isinstance(evento.get("mensagem"), str), "mensagem ausente")
    elif tipo == "log":
        _exigir(evento.get("nivel") in NIVEIS_DE_LOG, "nível de log inválido")
        _exigir(_texto(evento.get("mensagem")), "mensagem ausente")
        _exigir("etapa" not in evento or _inteiro(evento["etapa"]), "etapa inválida")
    elif tipo == "etapa.fim":
        _exigir(_inteiro(evento.get("indice")), "indice inválido")
        _exigir(_texto(evento.get("ferramenta")), "ferramenta ausente")
        for campo in ("linhas_antes", "linhas_depois", "duracao_ms"):
            _exigir(_inteiro(evento.get(campo)), f"{campo} inválido")
        resumo = evento.get("resumo")
        _exigir(
            isinstance(resumo, dict) and all(_inteiro(valor) for valor in resumo.values()),
            "resumo deve ter só contagens",
        )
    elif tipo == "saida.gravada":
        _exigir(_texto(evento.get("caminho")), "caminho ausente")
        _exigir(_inteiro(evento.get("abas")), "abas inválido")
        _exigir(_inteiro(evento.get("linhas")), "linhas inválido")
    elif tipo == "execucao.fim":
        status = evento.get("status")
        _exigir(status in STATUS_FINAIS, "status inválido")
        _exigir(_inteiro(evento.get("duracao_ms")), "duracao_ms inválido")
        _exigir(_inteiro(evento.get("avisos")), "avisos inválido")
        erro = evento.get("erro")
        if status == "erro":
            _exigir(isinstance(erro, dict) and _texto(erro.get("mensagem")), "erro sem mensagem")
        else:
            _exigir(erro is None, "erro só existe quando status = erro")


def agora_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


class Emissor:
    """Emite eventos validados para a saída padrão e para o arquivo de log."""

    def __init__(
        self,
        execucao: str,
        arquivo_log: Path | None,
        saida: TextIO | None = None,
        relogio: Callable[[], str] = agora_iso,
    ) -> None:
        self.execucao = execucao
        self._seq = 0
        self._saida = saida if saida is not None else sys.stdout
        self._relogio = relogio
        self._arquivo: TextIO | None = None
        if arquivo_log is not None:
            arquivo_log.parent.mkdir(parents=True, exist_ok=True)
            self._arquivo = arquivo_log.open("a", encoding="utf-8")
        self.avisos = 0

    def emitir(self, tipo: str, **campos: Any) -> dict[str, Any]:
        self._seq += 1
        evento = {"v": VERSAO, "execucao": self.execucao, "seq": self._seq, "ts": self._relogio(), "tipo": tipo}
        evento.update({chave: valor for chave, valor in campos.items() if valor is not None})
        validar_evento(evento)
        if tipo == "log" and evento["nivel"] == "aviso":
            self.avisos += 1
        linha = json.dumps(evento, ensure_ascii=False)
        for destino in (self._saida, self._arquivo):
            if destino is not None:
                destino.write(linha + "\n")
                destino.flush()
        return evento

    def fechar(self) -> None:
        if self._arquivo is not None:
            self._arquivo.close()
            self._arquivo = None
