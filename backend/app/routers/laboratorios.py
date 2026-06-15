from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/laboratorios", tags=["Laboratórios"])

_L = models.Laboratorio


@router.get("/kpis")
def laboratorios_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    total = (
        db.query(func.count(_L.nome))
        .filter(_L.nome != None)
        .scalar() or 0
    )
    return {"total_laboratorios": total}


@router.get("/filtros")
def laboratorios_filtros(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _unicos(col):
        return sorted(
            r[0] for r in db.query(col).filter(col != None).distinct().all()
        )

    return {
        "nomes":   _unicos(_L.nome),
        "centros": _unicos(_L.centro_campi),
    }


# Rota estática antes de /{id}
@router.get("/por-centro")
def laboratorios_por_centro(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    label = func.coalesce(func.nullif(_L.centro_campi, ""), "Em branco")
    rows = (
        db.query(label.label("centro"), func.count(_L.id).label("total"))
        .group_by(label)
        .order_by(func.count(_L.id).desc())
        .all()
    )
    return [{"centro": r.centro, "total": r.total} for r in rows]


@router.get("/", response_model=list[schemas.LaboratorioOut])
def listar_laboratorios(
    nome: str | None = Query(None),
    centro_campi: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_L)
    if nome:        q = q.filter(_L.nome.ilike(f"%{nome}%"))
    if centro_campi: q = q.filter(_L.centro_campi.ilike(f"%{centro_campi}%"))
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.LaboratorioOut)
def detalhe_laboratorio(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    lab = db.query(_L).filter(_L.id == id).first()
    if not lab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laboratório não encontrado")
    return lab
