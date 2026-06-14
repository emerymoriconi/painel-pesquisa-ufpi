import pandas as pd
from sqlalchemy.orm import Session
from app import models
from scripts.importers.utils import normalizar_colunas, safe_int, safe_str, log_resultado


def importar_nucleos(caminho_xlsx: str, db: Session):
    """Importa núcleos de pesquisa da aba 'Página1'.
    Apenas as colunas relevantes são mapeadas: denominação, situação,
    centro/campus, vinculação, ano da resolução e coordenador.
    """
    try:
        df = pd.read_excel(caminho_xlsx, sheet_name="Página1")
        df = normalizar_colunas(df)
    except Exception as e:
        print(f"[Erro] Falha ao ler Núcleos de Pesquisa: {e}")
        return

    inseridos, erros = 0, []
    for idx, row in df.iterrows():
        try:
            obj = models.NucleoPesquisa(
                id=int(row["n"]),
                denominacao=str(row["denominação"]),
                situacao=safe_str(row.get("situação")),
                centro_campus=safe_str(row.get("centrocampuspróreitoria")),
                vinculacao=safe_str(row.get("vinculação")),
                ano_resolucao=safe_int(row.get("ano_da_resolução")),
                coordenador=safe_str(row.get("coordenador")),
            )
            db.add(obj)
            inseridos += 1
        except Exception as e:
            erros.append({"linha": idx + 2, "erro": str(e)})

    db.commit()
    log_resultado("NÚCLEOS DE PESQUISA", inseridos, erros)
