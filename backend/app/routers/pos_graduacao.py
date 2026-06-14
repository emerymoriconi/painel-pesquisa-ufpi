from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/pos-graduacao", tags=["Pós-Graduação"])

_P = models.PosGraduacao


@router.get("/kpis")
def pos_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    total = (
        db.query(func.count(_P.programa))
        .filter(_P.programa != None)
        .scalar() or 0
    )
    return {"total": total}


@router.get("/filtros")
def pos_filtros(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _str(col):
        return sorted(
            r[0] for r in db.query(col).filter(col != None).distinct().all()
        )

    return {
        "programas":       _str(_P.programa),
        "conceitos_capes": sorted(
            r[0]
            for r in db.query(_P.conceito_capes).filter(_P.conceito_capes != None).distinct().all()
        ),
        "centros":         _str(_P.centro),
        "niveis":          _str(_P.nivel),
        "tipos":           _str(_P.tipo),
    }


# Rota estática antes de /{id}
@router.get("/por-centro")
def pos_por_centro(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    rows = (
        db.query(_P.centro, func.count(_P.id).label("total"))
        .filter(_P.centro != None)
        .group_by(_P.centro)
        .order_by(func.count(_P.id).desc())
        .all()
    )
    return [{"centro": r.centro, "total": r.total} for r in rows]


@router.get("/", response_model=list[schemas.PosGraduacaoOut])
def listar_pos(
    programa: str | None = Query(None),
    conceito_capes: int | None = Query(None),
    centro: str | None = Query(None),
    nivel: str | None = Query(None),
    tipo: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_P)
    if programa:       q = q.filter(_P.programa.ilike(f"%{programa}%"))
    if conceito_capes: q = q.filter(_P.conceito_capes == conceito_capes)
    if centro:         q = q.filter(_P.centro.ilike(f"%{centro}%"))
    if nivel:          q = q.filter(_P.nivel.ilike(f"%{nivel}%"))
    if tipo:           q = q.filter(_P.tipo.ilike(f"%{tipo}%"))
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.PosGraduacaoOut)
def detalhe_pos(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    programa = db.query(_P).filter(_P.id == id).first()
    if not programa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Programa não encontrado")
    return programa
