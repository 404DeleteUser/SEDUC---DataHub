"""Testa duplicatas com os valores Python preservados nas abas."""

from datetime import datetime
import random

from conftest import criar_xlsx, ler_xlsx
from datahub_engine.ferramentas.base import ContextoDaEtapa
from datahub_engine.ferramentas.duplicatas import executar as eliminar_duplicatas
from datahub_engine.pasta import Aba, Pasta


def etapa(ferramenta, **parametros):
    return {"ferramenta": ferramenta, "parametros": {"ferramentaId": ferramenta, **parametros}}


def executar_direto(aba, colunas, semente=7):
    contexto = ContextoDaEtapa(0, [], random.Random(semente), lambda: None)
    return eliminar_duplicatas(Pasta([aba]), {"colunasChave": colunas}, contexto)


def test_tipos_mistos_none_e_multiplas_chaves():
    valores = [1, 1.0, "1", True, None, None]
    linhas = [[valor, "grupo"] for valor in valores]
    resultado = executar_direto(Aba.de_linhas("Dados", ["Chave", "Grupo"], linhas), ["Chave", "Grupo"])
    assert resultado.resumo == {"duplicadas_removidas": 1, "grupos_com_duplicatas": 1}
    assert [linha[0] for linha in resultado.pasta.abas[0].linhas[:4]] == valores[:4]
    assert resultado.pasta.abas[0].linhas[4][0] is None


def test_nomes_repetidos_usam_primeira_coluna():
    aba = Aba.de_linhas("Dados", ["Chave", "Chave", "Id"], [["a", 1, 1], ["a", 2, 2]])
    resultado = executar_direto(aba, ["Chave"])
    assert resultado.resumo == {"duplicadas_removidas": 1, "grupos_com_duplicatas": 1}
    assert resultado.pasta.abas[0].cabecalho == ["Chave", "Chave", "Id"]


def test_ordem_reprodutibilidade_datas_e_inteiros(tmp_path, executar):
    data = datetime(2024, 2, 3, 4, 5)
    linhas = [["a", 1, data], ["b", 2, data], ["a", 3, data], ["a", 4, data]]
    base = criar_xlsx(tmp_path / "base.xlsx", ["Chave", "Id", "Data"], linhas)
    primeira = executar([base], [etapa("eliminar-duplicatas", colunasChave=["Chave"])], semente=1)
    segunda = executar(
        [base], [etapa("eliminar-duplicatas", colunasChave=["Chave"])], saida="outra.xlsx", semente=1
    )
    assert ler_xlsx(primeira.saida)["Dados"] == ler_xlsx(segunda.saida)["Dados"]
    original = Aba.de_linhas("Dados", ["Chave", "Id", "Data"], linhas)
    resultado = executar_direto(original, ["Chave"], semente=1)
    saida = resultado.pasta.abas[0]
    assert [linha[0] for linha in saida.linhas] == ["a", "b"]
    assert all(type(valor) is int for valor in saida.dados.iloc[:, 1])
    assert all(isinstance(valor, datetime) for valor in saida.dados.iloc[:, 2])
    assert original.linhas == linhas
