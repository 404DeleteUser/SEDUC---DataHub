"""Testes fictícios para a divisão pandas por valor."""

from datetime import datetime
import random

import pytest

from conftest import criar_xlsx, ler_xlsx
from datahub_engine.ferramentas.base import ContextoDaEtapa, ErroDaFerramenta
from datahub_engine.ferramentas.dividir import executar as dividir
from datahub_engine.pasta import Aba, Pasta


def etapa(**parametros):
    return {"ferramenta": "dividir-por", "parametros": {"ferramentaId": "dividir-por", **parametros}}


def test_ordem_normalizacao_valor_numerico_e_tipos(tmp_path, executar):
    data = datetime(2026, 3, 1)
    base = criar_xlsx(
        tmp_path / "dados.xlsx", ["Grupo", "Numero", "Data"],
        [["Árvore", 7, data], [2026, 8, data], ["arvore ", 9, data], ["B", 10, data]],
    )
    resultado = executar([base], [etapa(coluna="Grupo")])
    abas = ler_xlsx(resultado.saida)
    assert list(abas) == ["Consolidada", "Árvore", "2026", "B"]
    assert abas["Árvore"][1:] == [["Árvore", 7, data], ["arvore ", 9, data]]
    assert abas["2026"][1][1:] == [8, data]


def test_nomes_excel_colisoes_e_vazios(tmp_path, executar):
    longo = "Nome:*? muito longo para exceder trinta e um"
    base = criar_xlsx(
        tmp_path / "nomes.xlsx", ["Grupo", "Id"],
        [["Consolidada", 1], ["Outros", 2], [longo, 3], [None, 4], ["  ", 5]],
    )
    resultado = executar([base], [etapa(coluna="Grupo")])
    abas = ler_xlsx(resultado.saida)
    assert list(abas) == ["Consolidada", "Consolidada (2)", "Outros", "Nome muito longo para exceder t", "Outros (vazios)"]
    assert abas["Consolidada (2)"][1][0] == "Consolidada"
    assert [linha[0] for linha in abas["Outros (vazios)"][1:]] == [None, "  "]
    assert resultado.resumo() == {"abas_criadas": 4, "linhas_sem_valor": 2}


def test_erro_com_mais_de_uma_aba():
    pasta = Pasta([Aba.de_linhas("A", ["Grupo"], [["A"]]), Aba.de_linhas("B", ["Grupo"], [])])
    contexto = ContextoDaEtapa(0, [], random.Random(1), lambda: None)
    with pytest.raises(ErroDaFerramenta, match="Dividir Por precisa de uma aba só, e a planilha tem 2"):
        dividir(pasta, {"coluna": "Grupo"}, contexto)
