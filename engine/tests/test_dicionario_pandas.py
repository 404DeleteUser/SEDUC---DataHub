from __future__ import annotations

from datetime import datetime

from conftest import criar_xlsx, ler_xlsx


def etapa(ferramenta, **parametros):
    return {"ferramenta": ferramenta, "parametros": {"ferramentaId": ferramenta, **parametros}}


def test_contem_e_exato_normalizam_caixa_e_acento(tmp_path, executar):
    base = criar_xlsx(tmp_path / "base.xlsx", ["Cargo"], [["Professora de Matemática"], ["TÉCNICO"], ["Diretora"]])
    contem = executar([base], [etapa("dicionario", coluna="Cargo", modo="contem", valores=["PROFESSOR", "tecnico"])], saida="contem.xlsx")
    exato = executar([base], [etapa("dicionario", coluna="Cargo", modo="exato", valores=["técnico"])], saida="exato.xlsx")
    assert ler_xlsx(contem.saida)["Dados"][1:] == [["Professora de Matemática"], ["TÉCNICO"]]
    assert ler_xlsx(exato.saida)["Dados"][1:] == [["TÉCNICO"]]


def test_caracteres_de_regex_sao_literais(tmp_path, executar):
    base = criar_xlsx(tmp_path / "base.xlsx", ["Código"], [["(EF)"], ["a.b"], ["a-b"], ["xEF"]])
    resultado = executar([base], [etapa("dicionario", coluna="Código", modo="contem", valores=["(EF)", "a.b"])])
    assert ler_xlsx(resultado.saida)["Dados"][1:] == [["(EF)"], ["a.b"]]


def test_none_numerico_tipos_e_varias_abas(tmp_path, executar):
    data = datetime(2026, 3, 1)
    a = criar_xlsx(tmp_path / "a.xlsx", ["Chave", "Inteiro", "Data"], [[123, 7, data], [None, 8, data]])
    b = criar_xlsx(tmp_path / "b.xlsx", ["Chave", "Inteiro", "Data"], [["12x", 9, data], [None, 10, data]])
    resultado = executar(
        [a, b],
        [etapa("mesclar-planilhas", modo="abas"), etapa("dicionario", coluna="Chave", modo="contem", valores=["12"])],
    )
    abas = ler_xlsx(resultado.saida)
    assert list(abas) == ["a", "b"]
    assert abas["a"][1:] == [[123, 7, data]]
    assert abas["b"][1:] == [["12x", 9, data]]
    assert type(abas["a"][1][1]) is int
    assert type(abas["a"][1][2]) is datetime
    assert resultado.resumo(1) == {"linhas_mantidas": 2, "linhas_removidas": 2}
