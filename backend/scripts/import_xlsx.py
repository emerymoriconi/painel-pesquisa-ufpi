import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from scripts.importers import (
    importar_projetos_pdi,
    importar_projetos_finep,
    importar_producao_intelectual,
    importar_nucleos,
    importar_bolsistas,
    importar_grupos,
    importar_laboratorios,
    importar_incubadas,
    importar_pos_graduacao,
)

BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "xlsx")

ETAPAS = [
    (importar_projetos_pdi,           "PROJETOS_PDI.xlsx"),
    (importar_projetos_finep,         "PROJETOS_FINEP.xlsx"),
    (importar_producao_intelectual,   "PRODUCAO_INTELECTUAL.xlsx"),
    (importar_nucleos,                "NUCLEOS.xlsx"),
    (importar_bolsistas,              "BOLSISTAS.xlsx"),
    (importar_grupos,                 "GRUPOS.xlsx"),
    (importar_laboratorios,           "LABORATORIOS.xlsx"),
    (importar_incubadas,              "EMPRESAS_INCUBADAS.xlsx"),
    (importar_pos_graduacao,          "POS_GRADUACAO.xlsx"),
]


def main():
    print("=" * 60)
    print("  IMPORTAÇÃO COMPLETA — Painel de Pesquisa e Inovação")
    print("=" * 60)

    db = SessionLocal()
    try:
        for fn, arquivo in ETAPAS:
            caminho = os.path.join(BASE, arquivo)
            print(f"\n▶ {fn.__name__} ({arquivo})")
            print("-" * 60)
            try:
                fn(caminho, db)
            except Exception as e:
                print(f"  [FALHA CRÍTICA] {fn.__name__}: {e}")
    finally:
        db.close()

    print("\n" + "=" * 60)
    print("  Importação finalizada.")
    print("=" * 60)


if __name__ == "__main__":
    main()
