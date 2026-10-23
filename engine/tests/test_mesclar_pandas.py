"""Mesclagem de abas DataFrame com tipos de célula preservados."""

from __future__ import annotations

from datetime import datetime

from conftest import criar_xlsx, ler_xlsx


def etapa(ferramenta, **parametros):
    return {"ferramenta": ferramenta, "parametros": {"ferramentaId": ferramenta, **parametros}}


def test_vertical_reordena_cabecalho_e_preserva_tipos(tmp_path, executar):
    data = datetime(2026, 5, 2)
    a = criar_xlsx(tmp_path / "a.xlsx", ["Data", "Número", "Nome", "Opcional"], [[data, 7, "Ana", None]])
    b = criar_xlsx(tmp_path / "b.xlsx", ["nome", "NUMERO", "DÁTA", "opcional"], [["Bia", 9, data, None]])
    resultado = executar([a, b], [etapa("mesclar-planilhas", modo="vertical")])
    linhas = ler_xlsx(resultado.saida)["Dados"]
    assert linhas == [["Data", "Número", "Nome", "Opcional"], [data, 7, "Ana", None], [data, 9, "Bia", None]]
    assert resultado.resumo() == {"arquivos_mesclados": 2, "linhas": 2}


def test_abas_nomeia_arquivos_repetidos(tmp_path, executar):
    arquivo = criar_xlsx(tmp_path / "escola.xlsx", ["X"], [[1]])
    resultado = executar([arquivo, arquivo], [etapa("mesclar-planilhas", modo="abas")])
    assert list(ler_xlsx(resultado.saida)) == ["escola", "escola (2)"]
    assert resultado.resumo() == {"arquivos_mesclados": 2, "abas": 2}


def test_mesclar_e_dicionario_nao_alteram_entradas(tmp_path, executar):
    a = criar_xlsx(tmp_path / "a.xlsx", ["Grupo", "Valor"], [["manter", 1], ["remover", 2]])
    b = criar_xlsx(tmp_path / "b.xlsx", ["Valor", "Grupo"], [[3, "manter"], [4, "remover"]])
    resultado = executar(
        [a, b],
        [
            etapa("mesclar-planilhas", modo="vertical"),
            etapa("dicionario", coluna="Grupo", modo="exato", valores=["manter"]),
        ],
    )
    assert resultado.status == "concluido"
    assert resultado.resumo(0) == {"arquivos_mesclados": 2, "linhas": 4}
    assert resultado.resumo(1) == {"linhas_mantidas": 2, "linhas_removidas": 2}
    assert ler_xlsx(a)["Dados"][1:] == [["manter", 1], ["remover", 2]]
    assert ler_xlsx(b)["Dados"][1:] == [[3, "manter"], [4, "remover"]]
