"""Registro de logs: listar (status) e limpar (retenção de 90 dias)."""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone

from datahub_engine import registro


def _escrever(pasta, nome, eventos):
    arquivo = pasta / nome
    arquivo.write_text("".join(json.dumps(e) + "\n" for e in eventos), encoding="utf-8")
    return arquivo


def _inicio(execucao, ts="2026-10-22T14:30:05.120Z"):
    return {
        "v": 1, "execucao": execucao, "seq": 1, "ts": ts, "tipo": "execucao.inicio", "nome": "Auditoria",
        "origem": "processo", "usuario": "analista", "maquina": "PC",
        "entradas": [{"nome": "a.xlsx", "caminho": "C:\\a.xlsx"}],
        "saida": {"nome": "s.xlsx", "caminho": "C:\\s.xlsx"},
        "etapas": [{"indice": 0, "ferramenta": "dicionario", "parametros": {}}],
    }


def _fim(execucao, status="concluido", ts="2026-10-22T14:30:06.000Z", **extra):
    return {"v": 1, "execucao": execucao, "seq": 9, "ts": ts, "tipo": "execucao.fim", "status": status,
            "duracao_ms": 880, "avisos": 0, **extra}


def test_listar_resume_cada_execucao_da_mais_recente(tmp_path):
    _escrever(tmp_path, "a.jsonl", [_inicio("a"), _fim("a")])
    _escrever(tmp_path, "b.jsonl", [_inicio("b", "2026-10-23T08:00:00.000Z"),
                                    _fim("b", "erro", erro={"mensagem": "Coluna CPF ausente."})])
    resumos = registro.listar(tmp_path)
    assert [r["execucao"] for r in resumos] == ["b", "a"]
    assert resumos[0]["status"] == "erro" and resumos[0]["erro"] == "Coluna CPF ausente."
    assert resumos[1] | {"arquivo": None} == {
        "execucao": "a", "arquivo": None, "nome": "Auditoria", "origem": "processo", "usuario": "analista",
        "inicio": "2026-10-22T14:30:05.120Z", "fim": "2026-10-22T14:30:06.000Z", "status": "concluido",
        "duracao_ms": 880, "avisos": 0, "etapas": 1, "saida": "C:\\s.xlsx", "erro": None,
    }


def test_sem_fim_e_em_andamento_ou_interrompida(tmp_path):
    vivo = _escrever(tmp_path, "vivo.jsonl", [_inicio("vivo")])
    registro.marcador_de(vivo).write_text(str(os.getpid()), encoding="utf-8")
    morto = _escrever(tmp_path, "morto.jsonl", [_inicio("morto")])
    with morto.open("a", encoding="utf-8") as arquivo:
        arquivo.write('{"v":1,"execucao":"morto","seq":2,')  # linha cortada no meio
    status = {r["execucao"]: r["status"] for r in registro.listar(tmp_path)}
    assert status == {"vivo": "em_andamento", "morto": "interrompido"}


def test_limpar_apaga_so_o_que_passou_da_retencao(tmp_path):
    _escrever(tmp_path, "velho.jsonl", [_inicio("velho", "2026-07-01T00:00:00.000Z"), _fim("velho")])
    _escrever(tmp_path, "novo.jsonl", [_inicio("novo", "2026-10-01T00:00:00.000Z"), _fim("novo")])
    vivo = _escrever(tmp_path, "vivo.jsonl", [_inicio("vivo", "2026-01-01T00:00:00.000Z")])
    registro.marcador_de(vivo).write_text(str(os.getpid()), encoding="utf-8")
    agora = datetime(2026, 10, 22, tzinfo=timezone.utc)
    assert registro.limpar(tmp_path, 90, agora) == 1
    assert sorted(p.name for p in tmp_path.glob("*.jsonl")) == ["novo.jsonl", "vivo.jsonl"]


def test_nome_do_arquivo_ordena_por_data():
    nome = registro.nome_do_arquivo(datetime(2026, 10, 22, 17, 30, 5, tzinfo=timezone.utc), "abc123")
    assert nome.endswith("_abc123.jsonl") and nome[:10].count("-") == 2
