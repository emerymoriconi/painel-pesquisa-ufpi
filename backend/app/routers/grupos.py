from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/grupos", tags=["Grupos de Pesquisa"])

_G = models.GrupoPesquisa


@router.get("/kpis")
def grupos_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    total = (
        db.query(func.count(func.distinct(func.lower(func.trim(_G.nome_grupo)))))
        .filter(_G.status.ilike("certificado"))
        .scalar() or 0
    )
    return {"total_grupos": total}


@router.get("/filtros")
def grupos_filtros(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _unicos(col):
        return sorted(
            r[0] for r in db.query(col).filter(col != None).distinct().all()
        )

    return {
        "nomes":      _unicos(_G.nome_grupo),
        "areas":      _unicos(_G.area_predominante),
        "anos_envio": _unicos(_G.ultimo_envio),
    }


# Rota estática antes de /{id}
@router.get("/por-area")
def grupos_por_area(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    rows = (
        db.query(_G.area_predominante, func.count(_G.id).label("total"))
        .filter(_G.area_predominante != None)
        .group_by(_G.area_predominante)
        .order_by(func.count(_G.id).desc())
        .limit(10)
        .all()
    )
    return [{"area": r.area_predominante, "total": r.total} for r in rows]


@router.get("/", response_model=list[schemas.GrupoPesquisaOut])
def listar_grupos(
    nome_grupo: str | None = Query(None),
    area_predominante: str | None = Query(None),
    ultimo_envio: str | None = Query(None),
    situacao: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_G)
    if nome_grupo:        q = q.filter(_G.nome_grupo.ilike(f"%{nome_grupo}%"))
    if area_predominante: q = q.filter(_G.area_predominante.ilike(f"%{area_predominante}%"))
    if ultimo_envio:      q = q.filter(_G.ultimo_envio.ilike(f"%{ultimo_envio}%"))
    if situacao:          q = q.filter(_G.status.ilike(f"%{situacao}%"))
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.GrupoPesquisaOut)
def detalhe_grupo(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    grupo = db.query(_G).filter(_G.id == id).first()
    if not grupo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grupo não encontrado")
    return grupo
