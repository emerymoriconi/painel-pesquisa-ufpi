import pandas as pd

"""Utilitários para importação de dados,
incluindo normalização de colunas,
conversão segura de tipos e logging de resultados."""

_PLACEHOLDERS = {"--", "ni", "nan", "n/a", "none", ""}


def normalizar_colunas(df: pd.DataFrame) -> pd.DataFrame:
    """Padroniza os nomes das colunas retirando caracteres especiais e underscores."""
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(r'\s+', '_', regex=True)
        .str.replace(r'[^\w]', '', regex=True)
        .str.replace('\xa0', '', regex=False)
    )
    return df


def safe_str(value) -> str | None:
    """Converte value para string limpa ou None.

    - Retorna None para NaN, None, string vazia e placeholders como '--' e 'NI'
    - Faz strip de espaços em todas as extremidades
    - Converte floats inteiros (2017.0) para string sem casa decimal ('2017')
    """
    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass
    if isinstance(value, float) and value == int(value):
        value = int(value)
    result = str(value).strip()
    if result.lower() in _PLACEHOLDERS:
        return None
    return result


def safe_int(value) -> int | None:
    try:
        if pd.isna(value):
            return None
        return int(float(value))
    except Exception:
        return None


def safe_float(value) -> float | None:
    try:
        if pd.isna(value):
            return None
        return float(value)
    except Exception:
        return None


def log_resultado(modulo: str, inseridos: int, erros: list):
    print(f"[{modulo}] {inseridos} registros inseridos.")
    if erros:
        print(f"  -> {len(erros)} linha(s) com falha:")
        for e in erros[:5]:
            linha = e.get("linha", "?")
            erro = e.get("erro", str(e))
            print(f"     linha {linha}: {erro}")
        if len(erros) > 5:
            print(f"     ... e mais {len(erros) - 5} erro(s).")
