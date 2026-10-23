"""Catálogo de ferramentas gerado para o app e validação genérica dos parâmetros declarados."""

from __future__ import annotations

import json

import pytest

from datahub_engine.__main__ import main
from datahub_engine.catalogo import gerar_catalogo
from datahub_engine.ferramentas import FERRAMENTAS, ErroDaFerramenta

IDS_DO_APP = ["zebrar-planilha", "eliminar-duplicatas", "dicionario", "mesclar-planilhas", "dividir-por", "script-python"]


def test_catalogo_tem_os_ids_do_app_e_script_especial():
    catalogo = gerar_catalogo()
    assert catalogo["versao"] == 1
    assert [f["id"] for f in catalogo["ferramentas"]] == IDS_DO_APP
    assert [f["id"] for f in catalogo["ferramentas"] if f["especial"]] == ["script-python"]


def test_parametros_em_camel_case_iguais_ao_app():
    nomes = {f["id"]: [p["nome"] for p in f["parametros"]] for f in gerar_catalogo()["ferramentas"]}
    assert nomes["eliminar-duplicatas"] == ["colunasChave"]
    assert nomes["dicionario"] == ["coluna", "modo", "valores"]
    assert nomes["zebrar-planilha"] == ["corCabecalho", "corLinhaA", "corLinhaB"]
    assert nomes["mesclar-planilhas"] == ["modo"]
    assert nomes["dividir-por"] == ["coluna"]


def test_escolhas_trazem_opcoes_e_padrao():
    dicionario = next(f for f in gerar_catalogo()["ferramentas"] if f["id"] == "dicionario")
    modo = next(p for p in dicionario["parametros"] if p["nome"] == "modo")
    assert modo["opcoes"] == [{"valor": "contem", "rotulo": "Contém"}, {"valor": "exato", "rotulo": "Exato"}]
    assert modo["padrao"] == "contem"


def test_comando_catalogo_grava_json_utf8(tmp_path):
    destino = tmp_path / "gerado" / "catalogo.json"
    assert main(["catalogo", "--saida", str(destino)]) == 0
    assert json.loads(destino.read_text(encoding="utf-8")) == gerar_catalogo()
    assert "Dicionário" in destino.read_text(encoding="utf-8")


@pytest.mark.parametrize(
    ("ferramenta", "parametros", "mensagem"),
    [
        ("eliminar-duplicatas", {"colunasChave": []}, "Escolha ao menos uma coluna para identificar as duplicatas."),
        ("eliminar-duplicatas", {"colunasChave": ["  "]}, "Escolha ao menos uma coluna para identificar as duplicatas."),
        ("dicionario", {"coluna": "A", "modo": "parecido", "valores": ["x"]}, "Escolha se o valor deve estar contido ou ser exato."),
        ("dicionario", {"coluna": "A", "modo": "exato", "valores": [" ", ""]}, "Informe ao menos um valor para manter."),
        ("zebrar-planilha", {"corCabecalho": "#fff", "corLinhaA": "#ffffff", "corLinhaB": "#ffffff"}, "A cor do cabeçalho é inválida (use o formato #RRGGBB)."),
        ("dividir-por", {}, "Escolha a coluna para dividir."),
    ],
)
def test_validar_usa_a_mensagem_do_parametro(ferramenta, parametros, mensagem):
    with pytest.raises(ErroDaFerramenta, match=mensagem.replace("(", r"\(").replace(")", r"\)")):
        FERRAMENTAS[ferramenta].validar(parametros)
