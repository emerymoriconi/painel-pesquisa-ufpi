import pandas as pd
from sqlalchemy.orm import Session
from app import models
from scripts.importers.utils import normalizar_colunas, safe_str, log_resultado


def importar_bolsistas(caminho_xlsx: str, db: Session):
    """Importa bolsistas de produtividade da aba '2025'."""
    try:
        df = pd.read_excel(caminho_xlsx, sheet_name="2025")
        df = normalizar_colunas(df)
    except Exception as e:
        print(f"[Erro] Falha ao ler Bolsistas: {e}")
        return

    inseridos, erros = 0, []
    for idx, row in df.iterrows():
        try:
            obj = models.Bolsista(
                nome=str(row["nome"]),
                nivel=safe_str(row.get("nível")),
                modalidade=safe_str(row.get("modalidade")),
                campus_centro=safe_str(row.get("campuscentro")),
                orgao=safe_str(row.get("órgão")),
            )
            db.add(obj)
            inseridos += 1
        except Exception as e:
            erros.append({"linha": idx + 2, "erro": str(e)})

    db.commit()
    log_resultado("BOLSISTAS", inseridos, erros)


def importar_grupos(caminho_xlsx: str, db: Session):
    """Importa grupos de pesquisa da aba 'GRUPOS DE PESQUISA'.
    Colunas unnamed (vazias) são ignoradas automaticamente via .get().
    """
    try:
        df = pd.read_excel(caminho_xlsx, sheet_name="GRUPOS DE PESQUISA")
        df = normalizar_colunas(df)
    except Exception as e:
        print(f"[Erro] Falha ao ler Grupos de Pesquisa: {e}")
        return

    inseridos, erros = 0, []
    for idx, row in df.iterrows():
        try:
            obj = models.GrupoPesquisa(
                nome_grupo=str(row["nome_do_grupo"]),
                nome_lider=safe_str(row.get("nome_do_líder")),
                instituicao=safe_str(row.get("instituição")),
                area_predominante=safe_str(row.get("área_predominante")),
                ultimo_envio=safe_str(row.get("último_envio")),
                status=safe_str(row.get("situação")),
                link_acesso=safe_str(row.get("link_de_acesso")),
            )
            db.add(obj)
            inseridos += 1
        except Exception as e:
            erros.append({"linha": idx + 2, "erro": str(e)})

    db.commit()
    log_resultado("GRUPOS DE PESQUISA", inseridos, erros)
