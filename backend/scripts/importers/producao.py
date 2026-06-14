import pandas as pd
from sqlalchemy.orm import Session
from app import models
from scripts.importers.utils import normalizar_colunas, safe_int, safe_str, log_resultado


def importar_producao_intelectual(caminho_xlsx: str, db: Session):
    """Importa métricas anuais (PATENTES, SOFTWARE, MARCAS, DESENHO INDUSTRIAL)
    e os detalhes analíticos da aba VITRINE DO MEC.
    """
    abas_anuais = {
        "PATENTES":           "PATENTE",
        "SOFTWARE":           "SOFTWARE",
        "MARCAS":             "MARCA",
        "DESENHO INDUSTRIAL": "DESENHO INDUSTRIAL",
    }

    inseridos_met, erros_met = 0, []

    for aba, tipo_nome in abas_anuais.items():
        try:
            df = pd.read_excel(caminho_xlsx, sheet_name=aba)
            df = normalizar_colunas(df)

            for idx, row in df.iterrows():
                try:
                    ano_val = safe_int(row.get("ano"))
                    if not ano_val:
                        continue

                    obj = models.ProducaoAnual(
                        ano=ano_val,
                        tipo=tipo_nome,
                        depositadas=safe_int(row.get("depositadas")) or 0,
                        concedidas=safe_int(row.get("concedido")) or 0,
                        pendencias=safe_int(row.get("pendências")) or 0,
                        co_titularidade=safe_int(row.get("cotitularidade")) or 0,
                        arquivadas=safe_int(row.get("arquivadas")) or safe_int(row.get("arquivada")) or 0,
                        anuladas=safe_int(row.get("anuladas")) or safe_int(row.get("anulada")) or 0,
                        andamento_ufpi=safe_int(row.get("andamento_ufpi")) or 0,
                    )
                    db.add(obj)
                    inseridos_met += 1
                except Exception as e:
                    erros_met.append({"aba": aba, "linha": idx + 2, "erro": str(e)})
        except Exception as e:
            print(f"[Erro] Falha ao processar aba histórica {aba}: {e}")

    inseridos_vit, erros_vit = 0, []
    try:
        df_vitrine = pd.read_excel(caminho_xlsx, sheet_name="VITRINE DO MEC")
        df_vitrine = normalizar_colunas(df_vitrine)

        for idx, row in df_vitrine.iterrows():
            try:
                dep_date = pd.to_datetime(row.get("depósito"), errors="coerce")
                conc_date = pd.to_datetime(row.get("concessão"), errors="coerce")

                obj_vit = models.VitrineProducao(
                    pedido=safe_str(row.get("pedido")),
                    deposito=dep_date.date() if pd.notna(dep_date) else None,
                    concessao=conc_date.date() if pd.notna(conc_date) else None,
                    titulo=str(row["título"]),
                    descricao=safe_str(row.get("descrição")),
                    diferencial_tecnologico=safe_str(row.get("diferencial_tecnológico")),
                    inventores=safe_str(row.get("inventores")),
                    tipo=str(row["tipo"]).strip().upper(),
                    ano=safe_int(row.get("ano")),
                )
                db.add(obj_vit)
                inseridos_vit += 1
            except Exception as e:
                erros_vit.append({"linha": idx + 2, "erro": str(e)})
    except Exception as e:
        print(f"[Erro] Falha ao abrir aba VITRINE DO MEC: {e}")

    db.commit()
    log_resultado("MÉTRICAS ANUAIS DE PRODUÇÃO", inseridos_met, erros_met)
    log_resultado("VITRINE DO MEC (PROPRIEDADES)", inseridos_vit, erros_vit)
