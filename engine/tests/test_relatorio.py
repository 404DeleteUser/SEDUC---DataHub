"""Log legível gravado ao lado da planilha de saída. Dados fictícios."""

from __future__ import annotations

import io
import json
from pathlib import Path

from conftest import criar_xlsx
from datahub_engine.__main__ import main
from datahub_engine.eventos import Emissor
from datahub_engine.relatorio import caminho_do_relatorio, gravar_relatorio, renderizar


def _plano(tmp_path: Path, entradas: list[Path], etapas: list[dict], saida: Path | None = None) -> Path:
    caminho = tmp_path / "plano.json"
    destino = saida or tmp_path / "resultado.xlsx"
    caminho.write_text(
        json.dumps(
            {
                "versao": 1,
                "nome": "Auditoria",
                "origem": "processo",
                "entradas": [{"caminho": str(entrada)} for entrada in entradas],
                "saida": {"caminho": str(destino)},
                "etapas": etapas,
            }
        ),
        encoding="utf-8",
    )
    return caminho


def _rodar(tmp_path: Path, plano: Path) -> int:
    return main(["executar", "--plano", str(plano), "--logs-dir", str(tmp_path / "logs"), "--semente", "1"])


def test_cli_grava_log_legivel_com_bom_crlf_e_sem_valores_de_celulas(tmp_path, capsys):
    entrada = criar_xlsx(
        tmp_path / "base.xlsx",
        ["CPF", "Cargo"],
        [["CELULA_SECRETA_1", "Professora"], ["CELULA_SECRETA_1", "Professora"], ["CELULA_SECRETA_2", "Diretora"]],
    )
    etapas = [
        {"ferramenta": "eliminar-duplicatas", "parametros": {"ferramentaId": "eliminar-duplicatas", "colunasChave": ["CPF"]}},
        {"ferramenta": "dicionario", "parametros": {"coluna": "Cargo", "modo": "contem", "valores": ["PROFESSOR", " "]}},
        {"ferramenta": "zebrar-planilha", "parametros": {"corCabecalho": "#1f4e79", "corLinhaA": "#ffffff", "corLinhaB": "#e8effc"}},
    ]
    assert _rodar(tmp_path, _plano(tmp_path, [entrada], etapas)) == 0
    capsys.readouterr()

    bruto = (tmp_path / "resultado_log.txt").read_bytes()
    assert bruto.startswith(b"\xef\xbb\xbf")
    assert bruto.count(b"\r\n") == bruto.count(b"\n")
    texto = bruto.decode("utf-8-sig").replace("\r\n", "\n")
    assert texto.startswith("DataHub - Registro da execução\n")
    assert "base.xlsx: 3 linhas, 2 colunas" in texto
    assert "1. Eliminar Duplicatas\n   Colunas-chave: CPF\n   Linhas: 3 → 2\n   Duplicadas removidas: 1" in texto
    assert "2. Dicionário\n   Coluna: Cargo\n   Como comparar: Contém\n   Valores para manter: 1 valor(es)" in texto
    assert "Cor do cabeçalho: #1F4E79" in texto
    assert "Arquivo gravado: resultado.xlsx (1 abas, 1 linhas)" in texto
    assert "Status: Concluído" in texto
    for privado in ("CELULA_SECRETA", "PROFESSOR", "Professora", "Diretora", "ferramentaId"):
        assert privado not in texto


def test_erro_mostra_etapa_contada_de_um_e_omite_traceback(tmp_path, capsys):
    entrada = criar_xlsx(tmp_path / "base.xlsx", ["CPF"], [["1"]])
    etapas = [
        {"ferramenta": "zebrar-planilha", "parametros": {"corCabecalho": "#000000", "corLinhaA": "#ffffff", "corLinhaB": "#eeeeee"}},
        {"ferramenta": "dividir-por", "parametros": {"coluna": "Matrícula"}},
    ]
    assert _rodar(tmp_path, _plano(tmp_path, [entrada], etapas)) == 1
    capsys.readouterr()
    texto = (tmp_path / "resultado_log.txt").read_text(encoding="utf-8-sig")
    assert "Status: Erro" in texto
    assert "Erro: A coluna Matrícula não existe na aba Dados." in texto
    assert "Na etapa: 2" in texto
    assert "Arquivo gravado: nenhum." in texto


def test_traceback_nunca_aparece_e_execucao_incompleta_e_cancelada():
    inicio = {
        "tipo": "execucao.inicio",
        "ts": "2026-10-22T12:00:00.000Z",
        "nome": "Teste",
        "origem": "processo",
        "entradas": [],
        "etapas": [{"indice": 0, "ferramenta": "dividir-por", "parametros": {"coluna": "Escola"}}],
        "saida": {"nome": "a.xlsx", "caminho": "a.xlsx"},
    }
    fim = {"tipo": "execucao.fim", "status": "erro", "duracao_ms": 12, "erro": {"mensagem": "Falhou", "detalhe": "TRACEBACK_SECRETO"}}
    assert "TRACEBACK_SECRETO" not in renderizar([inicio, fim])
    incompleto = renderizar([inicio])
    assert "Status: Interrompido" in incompleto and "1. Dividir Por\n   Coluna: Escola\n   Não executada." in incompleto
    assert "Status: Cancelado" in renderizar([{"tipo": "execucao.fim", "status": "cancelado", "duracao_ms": 1}])


def test_log_vai_para_a_pasta_criada_para_a_saida(tmp_path, capsys):
    entrada = criar_xlsx(tmp_path / "base.xlsx", ["A"], [["1"]])
    plano = _plano(tmp_path, [entrada], [], saida=tmp_path / "nova" / "saida.csv")
    assert _rodar(tmp_path, plano) == 0
    capsys.readouterr()
    assert "Arquivo gravado: saida.csv" in (tmp_path / "nova" / "saida_log.txt").read_text(encoding="utf-8-sig")


def test_erro_ao_gravar_log_vira_aviso_sem_mudar_o_codigo(tmp_path, capsys, monkeypatch):
    def falhar(*_):
        raise PermissionError("pasta somente leitura")

    monkeypatch.setattr("datahub_engine.__main__.gravar_relatorio", falhar)
    entrada = criar_xlsx(tmp_path / "base.xlsx", ["A"], [["1"]])
    assert _rodar(tmp_path, _plano(tmp_path, [entrada], [])) == 0
    assert "Não foi possível gravar o log legível" in capsys.readouterr().err


def test_emissor_eventos_devolve_copia_e_gravador_troca_arquivo(tmp_path):
    emissor = Emissor("teste", None, saida=io.StringIO())
    emissor.emitir("execucao.fim", status="cancelado", duracao_ms=0, avisos=0)
    copia = emissor.eventos
    copia.clear()
    assert len(emissor.eventos) == 1
    destino = caminho_do_relatorio(tmp_path / "arquivo.xlsx")
    assert destino.name == "arquivo_log.txt"
    gravar_relatorio(emissor.eventos, destino)
    gravar_relatorio(emissor.eventos, destino)  # sobrescreve sem deixar temporários
    assert [p.name for p in tmp_path.iterdir() if p.name.startswith(".")] == []
    assert destino.read_text(encoding="utf-8-sig").startswith("DataHub - Registro da execução")
