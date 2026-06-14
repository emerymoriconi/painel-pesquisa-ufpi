from fastapi import APIRouter, Depends
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao
import os

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis", response_model=schemas.KPIsOut)
def get_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    total_pdi = (
        db.query(func.count(models.ProjetoPDI.id))
        .filter(
            or_(
                models.ProjetoPDI.situacao.ilike("Concluído"),
                models.ProjetoPDI.situacao.ilike("Em andamento"),
            )
        )
        .scalar() or 0
    )

    valor_finep_formal = db.query(func.sum(models.ProjetoFinep.valor)).scalar() or 0
    valor_finep_pdi = (
        db.query(func.sum(models.ProjetoPDI.valor_total))
        .filter(models.ProjetoPDI.agencia_fomento.ilike("FINEP"))
        .scalar() or 0
    )
    total_finep = round((valor_finep_formal + valor_finep_pdi) / 1_000_000, 2)

    total_producao = (
        db.query(func.sum(models.ProducaoAnual.depositadas)).scalar() or 0
    )

    total_bolsistas = (
        db.query(func.count(models.Bolsista.nome))
        .filter(models.Bolsista.nome != None)
        .scalar() or 0
    )

    total_nucleos = (
        db.query(func.count(models.NucleoPesquisa.denominacao))
        .filter(models.NucleoPesquisa.denominacao != None)
        .scalar() or 0
    )

    total_grupos = (
        db.query(func.count(func.distinct(func.lower(func.trim(models.GrupoPesquisa.nome_grupo)))))
        .filter(models.GrupoPesquisa.status.ilike("certificado"))
        .scalar() or 0
    )

    total_incubadas = (
        db.query(func.count(models.EmpresaIncubada.nome_projeto))
        .filter(models.EmpresaIncubada.nome_projeto != None)
        .scalar() or 0
    )

    total_pos = (
        db.query(func.count(models.PosGraduacao.programa))
        .filter(models.PosGraduacao.programa != None)
        .scalar() or 0
    )

    total_labs = (
        db.query(func.count(models.Laboratorio.nome))
        .filter(models.Laboratorio.nome != None)
        .scalar() or 0
    )

    return {
        "total_projetos_pdi":         total_pdi,
        "total_projetos_finep":       total_finep,
        "total_producao_intelectual": total_producao,
        "total_bolsistas":            total_bolsistas,
        "total_nucleos":              total_nucleos,
        "total_grupos":               total_grupos,
        "total_incubadas":            total_incubadas,
        "total_pos_graduacao":        total_pos,
        "total_laboratorios":         total_labs,
        "ultima_atualizacao":         os.getenv("ULTIMA_ATUALIZACAO", "08/02/2026"),
    }
