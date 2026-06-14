from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/bolsistas", tags=["Bolsistas"])

_B = models.Bolsista


@router.get("/kpis")
def bolsistas_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    cnpq = (
        db.query(func.count(_B.id))
        .filter(_B.orgao.ilike("%CNPq%") | _B.orgao.ilike("%CNPQ%"))
        .scalar() or 0
    )
    ufpi = (
        db.query(func.count(_B.id))
        .filter(_B.orgao.ilike("%UFPI%"))
        .scalar() or 0
    )
    total = db.query(func.count(_B.id)).scalar() or 0
    return {"cnpq": cnpq, "ufpi": ufpi, "total": total}


@router.get("/filtros")
def bolsistas_filtros(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _unicos(col):
        return sorted(
            r[0] for r in db.query(col).filter(col != None).distinct().all()
        )

    return {
        "modalidades": _unicos(_B.modalidade),
        "orgaos":      _unicos(_B.orgao),
        "campi":       _unicos(_B.campus_centro),
        "nomes":       _unicos(_B.nome),
    }


# Rota estática antes de /{id}
@router.get("/por-campus")
def bolsistas_por_campus(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    rows = (
        db.query(_B.campus_centro, func.count(_B.nome).label("total"))
        .filter(_B.campus_centro != None)
        .group_by(_B.campus_centro)
        .order_by(func.count(_B.nome).desc())
        .all()
    )
    return [{"campus": r.campus_centro, "total": r.total} for r in rows]


@router.get("/", response_model=list[schemas.BolsistaOut])
def listar_bolsistas(
    modalidade: str | None = Query(None),
    orgao: str | None = Query(None),
    campus_centro: str | None = Query(None),
    nome: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_B)
    if modalidade:    q = q.filter(_B.modalidade.ilike(f"%{modalidade}%"))
    if orgao:         q = q.filter(_B.orgao.ilike(f"%{orgao}%"))
    if campus_centro: q = q.filter(_B.campus_centro.ilike(f"%{campus_centro}%"))
    if nome:          q = q.filter(_B.nome.ilike(f"%{nome}%"))
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.BolsistaOut)
def detalhe_bolsista(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    bolsista = db.query(_B).filter(_B.id == id).first()
    if not bolsista:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bolsista não encontrado")
    return bolsista
