from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func, distinct
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/incubadas", tags=["Empresas Incubadas"])

_E = models.EmpresaIncubada


@router.get("/kpis")
def incubadas_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    total_incubadas = (
        db.query(func.count(_E.nome_projeto))
        .filter(_E.nome_projeto != None)
        .scalar() or 0
    )
    graduadas = (
        db.query(func.count(_E.id))
        .filter(_E.tipo_empresa.ilike("%graduada%"))
        .scalar() or 0
    )
    total_incubadoras = (
        db.query(func.count(distinct(_E.incubadora)))
        .filter(_E.incubadora != None)
        .scalar() or 0
    )
    return {
        "total_incubadas":    total_incubadas,
        "total_graduadas":    graduadas,
        "total_incubadoras":  total_incubadoras,
    }


@router.get("/filtros")
def incubadas_filtros(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _unicos(col):
        return sorted(
            r[0] for r in db.query(col).filter(col != None).distinct().all()
        )

    return {
        "incubadoras": _unicos(_E.incubadora),
        "situacoes":   _unicos(_E.tipo_empresa),
    }


# Rota estática antes de /{id}
@router.get("/por-incubadora")
def incubadas_por_incubadora(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    rows = (
        db.query(_E.incubadora, func.count(_E.id).label("total"))
        .filter(_E.incubadora != None)
        .group_by(_E.incubadora)
        .order_by(func.count(_E.id).desc())
        .all()
    )
    return [{"incubadora": r.incubadora, "total": r.total} for r in rows]


@router.get("/", response_model=list[schemas.EmpresaIncubadaOut])
def listar_incubadas(
    incubadora: str | None = Query(None),
    situacao: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_E)
    if incubadora: q = q.filter(_E.incubadora.ilike(f"%{incubadora}%"))
    if situacao:   q = q.filter(_E.tipo_empresa.ilike(f"%{situacao}%"))
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.EmpresaIncubadaOut)
def detalhe_incubada(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    empresa = db.query(_E).filter(_E.id == id).first()
    if not empresa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa não encontrada")
    return empresa
