"""Testes unitários — funções puras sem banco ou HTTP."""
import pandas as pd
import pytest
from fastapi import HTTPException

from app.auth import criar_token, gerar_hash, verificar_senha, verificar_token
from scripts.importers.utils import (
    normalizar_colunas,
    safe_float,
    safe_int,
    safe_str,
)


# ── safe_str ──────────────────────────────────────────────────────────────────

def test_safe_str_none_para_nan():
    assert safe_str(float("nan")) is None


def test_safe_str_none_para_placeholder_dash():
    assert safe_str("--") is None


def test_safe_str_none_para_string_vazia():
    assert safe_str("") is None


def test_safe_str_none_para_ni():
    assert safe_str("NI") is None


def test_safe_str_faz_strip():
    assert safe_str("  texto  ") == "texto"


def test_safe_str_float_inteiro_vira_string_sem_decimal():
    assert safe_str(2017.0) == "2017"


def test_safe_str_retorna_string_normal():
    assert safe_str("Pesquisa") == "Pesquisa"


# ── safe_int ──────────────────────────────────────────────────────────────────

def test_safe_int_none_para_nan():
    assert safe_int(float("nan")) is None


def test_safe_int_trunca_float():
    assert safe_int(3.9) == 3


def test_safe_int_converte_string_numerica():
    assert safe_int("42") == 42


def test_safe_int_none_para_texto():
    assert safe_int("abc") is None


# ── safe_float ────────────────────────────────────────────────────────────────

def test_safe_float_none_para_nan():
    assert safe_float(float("nan")) is None


def test_safe_float_converte_string():
    assert safe_float("3.14") == pytest.approx(3.14)


def test_safe_float_none_para_texto():
    assert safe_float("abc") is None


# ── normalizar_colunas ────────────────────────────────────────────────────────

def test_normalizar_colunas_lowercase():
    df = pd.DataFrame(columns=["NOME", "VALOR"])
    df = normalizar_colunas(df)
    assert list(df.columns) == ["nome", "valor"]


def test_normalizar_colunas_espacos_viram_underscore():
    df = pd.DataFrame(columns=["VALOR TOTAL"])
    df = normalizar_colunas(df)
    assert list(df.columns) == ["valor_total"]


def test_normalizar_colunas_remove_barra():
    df = pd.DataFrame(columns=["edital/chamada"])
    df = normalizar_colunas(df)
    assert list(df.columns) == ["editalchamada"]


def test_normalizar_colunas_strip_espacos_extremos():
    df = pd.DataFrame(columns=["  nome  "])
    df = normalizar_colunas(df)
    assert list(df.columns) == ["nome"]


# ── auth ──────────────────────────────────────────────────────────────────────

def test_gerar_hash_retorna_string():
    h = gerar_hash("senha123")
    assert isinstance(h, str) and h.startswith("$2")


def test_verificar_senha_correta():
    h = gerar_hash("secreta")
    assert verificar_senha("secreta", h) is True


def test_verificar_senha_errada():
    h = gerar_hash("secreta")
    assert verificar_senha("errada", h) is False


def test_criar_token_retorna_string():
    token = criar_token({"sub": "admin"})
    assert isinstance(token, str) and len(token) > 10


def test_verificar_token_valido():
    token = criar_token({"sub": "usuario"})
    payload = verificar_token(token)
    assert payload["sub"] == "usuario"


def test_verificar_token_invalido_lanca_401():
    with pytest.raises(HTTPException) as exc:
        verificar_token("token.invalido.aqui")
    assert exc.value.status_code == 401
