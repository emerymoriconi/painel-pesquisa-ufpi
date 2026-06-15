from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/nucleos", tags=["Núcleos de Pesquisa"])

_N = models.NucleoPesquisa


@router.get("/kpis")
def nucleos_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    total = (
        db.query(func.count(_N.denominacao))
        .filter(_N.denominacao != None)
        .scalar() or 0
    )
    ativos = (
        db.query(func.count(_N.id))
        .filter(_N.situacao.ilike("ativo"))
        .scalar() or 0
    )
    inativos = (
        db.query(func.count(_N.id))
        .filter(_N.situacao.ilike("inativo"))
        .scalar() or 0
    )
    return {"total_nucleos": total, "total_ativos": ativos, "total_inativos": inativos}


@router.get("/filtros")
def nucleos_filtros(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _str(col):
        return sorted(
            r[0] for r in db.query(col).filter(col != None).distinct().all()
        )

    def _str_sem_dash(col):
        return sorted(
            r[0] for r in db.query(col).filter(col != None, col != "--").distinct().all()
        )

    return {
        "centros":     _str_sem_dash(_N.centro_campus),
        "vinculacoes": _str(_N.vinculacao),
        "anos":        sorted(
            r[0] for r in db.query(_N.ano_resolucao).filter(_N.ano_resolucao != None).distinct().all()
        ),
        "nucleos":     _str(_N.denominacao),
    }


# Rota estática antes de /{id}
@router.get("/por-centro")
def nucleos_por_centro(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    rows = (
        db.query(_N.centro_campus, func.count(_N.id).label("total"))
        .filter(_N.centro_campus != None, _N.centro_campus != "--")
        .group_by(_N.centro_campus)
        .order_by(func.count(_N.id).desc())
        .all()
    )
    return [{"centro": r.centro_campus, "total": r.total} for r in rows]


@router.get("/", response_model=list[schemas.NucleoPesquisaOut])
def listar_nucleos(
    centro_campus: str | None = Query(None),
    vinculacao: str | None = Query(None),
    ano_resolucao: int | None = Query(None),
    denominacao: str | None = Query(None),
    situacao: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_N)
    if centro_campus:  q = q.filter(_N.centro_campus.ilike(f"%{centro_campus}%"))
    if vinculacao:     q = q.filter(_N.vinculacao.ilike(f"%{vinculacao}%"))
    if ano_resolucao:  q = q.filter(_N.ano_resolucao == ano_resolucao)
    if denominacao:    q = q.filter(_N.denominacao.ilike(f"%{denominacao}%"))
    if situacao:       q = q.filter(_N.situacao.ilike(f"%{situacao}%"))
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.NucleoPesquisaOut)
def detalhe_nucleo(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    nucleo = db.query(_N).filter(_N.id == id).first()
    if not nucleo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Núcleo não encontrado")
    return nucleo
