from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/projetos", tags=["Projetos"])

_PDI = models.ProjetoPDI


# ── PDI ───────────────────────────────────────────────────────────────────────

@router.get("/pdi/kpis")
def pdi_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    concluidos = (
        db.query(func.count(_PDI.id))
        .filter(_PDI.situacao.ilike("Concluído"))
        .scalar() or 0
    )
    em_andamento = (
        db.query(func.count(_PDI.id))
        .filter(_PDI.situacao.ilike("Em andamento"))
        .scalar() or 0
    )
    return {"total_concluidos": concluidos, "total_em_andamento": em_andamento}


@router.get("/pdi/filtros")
def pdi_filtros(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _str(col):
        return sorted(
            r[0]
            for r in db.query(col).filter(col != None, col != "--").distinct().all()
        )

    def _int(col):
        return sorted(
            r[0]
            for r in db.query(col).filter(col != None).distinct().all()
        )

    return {
        "anos_inicio":  _int(_PDI.ano_inicio),
        "anos_termino": _int(_PDI.ano_fim),
        "centros":      _str(_PDI.centro),
        "naturezas":    _str(_PDI.natureza),
        "areas":        _str(_PDI.area),
        "situacoes":    _str(_PDI.situacao),
    }


# Rotas estáticas antes de /{projeto_id} para evitar captura pelo path param
@router.get("/pdi/por-area")
def pdi_por_area(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    rows = (
        db.query(_PDI.area, func.count(_PDI.id).label("total"))
        .filter(_PDI.area != None, _PDI.area != "--")
        .group_by(_PDI.area)
        .order_by(func.count(_PDI.id).desc())
        .all()
    )
    return [{"area": r.area, "total": r.total} for r in rows]


@router.get("/pdi/por-centro")
def pdi_por_centro(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    rows = (
        db.query(_PDI.centro, func.count(_PDI.id).label("total"))
        .filter(_PDI.centro != None, _PDI.centro != "--")
        .group_by(_PDI.centro)
        .order_by(func.count(_PDI.id).desc())
        .all()
    )
    return [{"centro": r.centro, "total": r.total} for r in rows]


@router.get("/pdi", response_model=list[schemas.ProjetoPDIOut])
def listar_pdi(
    ano_inicio: int | None = Query(None),
    ano_termino: int | None = Query(None),
    centro: str | None = Query(None),
    natureza: str | None = Query(None),
    area: str | None = Query(None),
    situacao: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_PDI)
    if ano_inicio:  q = q.filter(_PDI.ano_inicio == ano_inicio)
    if ano_termino: q = q.filter(_PDI.ano_fim == ano_termino)
    if centro:      q = q.filter(_PDI.centro.ilike(f"%{centro}%"))
    if natureza:    q = q.filter(_PDI.natureza.ilike(f"%{natureza}%"))
    if area:        q = q.filter(_PDI.area.ilike(f"%{area}%"))
    if situacao:    q = q.filter(_PDI.situacao.ilike(f"%{situacao}%"))
    return q.offset(skip).limit(limit).all()


@router.get("/pdi/{projeto_id}", response_model=schemas.ProjetoPDIOut)
def detalhe_pdi(
    projeto_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    projeto = db.query(_PDI).filter(_PDI.id == projeto_id).first()
    if not projeto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado")
    return projeto
