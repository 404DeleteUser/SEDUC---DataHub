import json

import pytest

from datahub_engine.eventos import EventoInvalido, validar_evento
from conftest import CONTRATO


def exemplos(nome):
    linhas = (CONTRATO / nome).read_text(encoding="utf-8").splitlines()
    return [json.loads(linha) for linha in linhas if linha.strip()]


@pytest.mark.parametrize("evento", exemplos("exemplos-validos.jsonl"))
def test_exemplos_validos_passam(evento):
    validar_evento(evento)


@pytest.mark.parametrize("evento", exemplos("exemplos-invalidos.jsonl"))
def test_exemplos_invalidos_sao_recusados(evento):
    with pytest.raises(EventoInvalido):
        validar_evento(evento)
