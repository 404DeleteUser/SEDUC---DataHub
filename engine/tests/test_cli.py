"""Linha de comando, como o app vai chamar o motor (processo separado)."""

from __future__ import annotations

import json
import subprocess
import sys

from datahub_engine.eventos import validar_evento
from conftest import criar_xlsx


def _rodar(*argumentos, entrada=None):
    return subprocess.run(
        [sys.executable, "-m", "datahub_engine", *argumentos],
        input=entrada, capture_output=True, text=True, encoding="utf-8", timeout=60,
    )


def _plano(tmp_path, etapas, nome="plano.json"):
    base = criar_xlsx(tmp_path / "base.xlsx", ["CPF"], [["1"], ["1"], ["2"]])
    plano = {
        "versao": 1, "nome": "Auditoria", "origem": "processo",
        "entradas": [{"caminho": str(base)}], "saida": {"caminho": str(tmp_path / "saida.xlsx")},
        "etapas": etapas,
    }
    caminho = tmp_path / nome
    caminho.write_text(json.dumps(plano), encoding="utf-8")
    return caminho


DUPLICATAS = {"ferramenta": "eliminar-duplicatas", "parametros": {"colunasChave": ["CPF"]}}


def test_executar_emite_na_saida_os_mesmos_eventos_do_arquivo_de_log(tmp_path):
    logs = tmp_path / "logs"
    processo = _rodar("executar", "--plano", str(_plano(tmp_path, [DUPLICATAS])), "--logs-dir", str(logs))
    assert processo.returncode == 0, processo.stderr
    ao_vivo = [json.loads(linha) for linha in processo.stdout.splitlines()]
    for evento in ao_vivo:
        validar_evento(evento)
    (arquivo,) = logs.glob("*.jsonl")
    assert [json.loads(l) for l in arquivo.read_text(encoding="utf-8").splitlines()] == ao_vivo
    assert ao_vivo[-1]["status"] == "concluido"
    assert not list(logs.glob("*.em-andamento"))

    listados = json.loads(_rodar("logs", "listar", "--logs-dir", str(logs)).stdout)
    assert [(r["nome"], r["status"]) for r in listados] == [("Auditoria", "concluido")]


def test_plano_invalido_sai_com_codigo_2_sem_criar_log(tmp_path):
    caminho = tmp_path / "plano.json"
    caminho.write_text('{"versao": 1}', encoding="utf-8")
    processo = _rodar("executar", "--plano", str(caminho), "--logs-dir", str(tmp_path / "logs"))
    assert processo.returncode == 2
    assert "Plano inválido" in json.loads(processo.stderr)["erro"]
    assert not (tmp_path / "logs").exists() or not list((tmp_path / "logs").glob("*.jsonl"))


def test_erro_na_etapa_sai_com_codigo_1(tmp_path):
    etapa = {"ferramenta": "eliminar-duplicatas", "parametros": {"colunasChave": ["Matrícula"]}}
    processo = _rodar("executar", "--plano", str(_plano(tmp_path, [etapa])), "--logs-dir", str(tmp_path / "l"))
    assert processo.returncode == 1
    assert json.loads(processo.stdout.splitlines()[-1])["status"] == "erro"


def test_cancelar_pela_entrada_padrao(tmp_path):
    lento = tmp_path / "lento.py"
    lento.write_text("import time\ntime.sleep(1.5)\n", encoding="utf-8")
    etapas = [{"ferramenta": "script-python", "script": {"principal": str(lento)}}, DUPLICATAS]
    processo = _rodar(
        "executar", "--plano", str(_plano(tmp_path, etapas)), "--logs-dir", str(tmp_path / "l"),
        entrada="cancelar\n",
    )
    assert processo.returncode == 130
    fim = json.loads(processo.stdout.splitlines()[-1])
    assert fim["status"] == "cancelado"
    assert not (tmp_path / "saida.xlsx").exists()


def test_logs_limpar_e_versao(tmp_path):
    assert json.loads(_rodar("logs", "limpar", "--logs-dir", str(tmp_path)).stdout) == {"removidos": 0}
    assert _rodar("versao").stdout.strip() == "0.1.0"
