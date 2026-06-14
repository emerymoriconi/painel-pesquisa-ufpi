from collections import defaultdict
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/finep", tags=["FINEP"])

_PDI = models.ProjetoPDI
# Filtro base: projetos PDI custeados pela FINEP (cobre "FINEP" e "FINEP/FUNARBE")
_FINEP = _PDI.agencia_fomento.ilike("FINEP")


# ── KPIs ─────────────────────────────────────────────────────────────────────
# Fonte: projetos_finep (tabela dedicada com contratos formais FINEP)

@router.get("/kpis")
def finep_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    valor = db.query(func.sum(models.ProjetoFinep.valor)).scalar() or 0.0
    total = db.query(func.count(models.ProjetoFinep.id)).scalar() or 0
    return {
        "valor_total_mi": round(valor / 1_000_000, 2),
        "total_projetos": total,
    }


# ── Filtros / agregações — Fonte: projetos_pdi WHERE agencia_fomento ilike FINEP ──

@router.get("/filtros")
def finep_filtros(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _str(col):
        return sorted(
            r[0]
            for r in db.query(col).filter(_FINEP, col != None, col != "--").distinct().all()
        )

    def _int(col):
        return sorted(
            r[0]
            for r in db.query(col).filter(_FINEP, col != None).distinct().all()
        )

    return {
        "anos_inicio":  _int(_PDI.ano_inicio),
        "anos_termino": _int(_PDI.ano_fim),
        "centros":      _str(_PDI.centro),
        "naturezas":    _str(_PDI.natureza),
        "situacoes":    _str(_PDI.situacao),
    }


# Rotas estáticas antes de /{id} para evitar captura pelo path param
@router.get("/relacao-tipo")
def finep_relacao_tipo(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    """Agrupa por modalidade (interno/externo) — alimenta o gráfico donut."""
    rows = (
        db.query(_PDI.modalidade, func.count(_PDI.id).label("total"))
        .filter(_FINEP, _PDI.modalidade != None)
        .group_by(_PDI.modalidade)
        .all()
    )
    agrupado: dict[str, int] = defaultdict(int)
    for r in rows:
        agrupado[r.modalidade.strip().title()] += r.total
    return [
        {"tipo": tipo, "total": total}
        for tipo, total in sorted(agrupado.items(), key=lambda x: -x[1])
    ]


@router.get("/por-centro")
def finep_por_centro(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    """Soma valor_total de projetos_pdi por centro, convertido para milhões."""
    rows = (
        db.query(_PDI.centro, func.sum(_PDI.valor_total).label("valor_total"))
        .filter(_FINEP, _PDI.centro != None, _PDI.centro != "--")
        .group_by(_PDI.centro)
        .order_by(func.sum(_PDI.valor_total).desc())
        .all()
    )
    return [
        {"centro": r.centro, "valor_mi": round((r.valor_total or 0) / 1_000_000, 2)}
        for r in rows
    ]


@router.get("", response_model=list[schemas.ProjetoPDIOut])
def listar_finep(
    ano_inicio: int | None = Query(None),
    ano_termino: int | None = Query(None),
    centro: str | None = Query(None),
    natureza: str | None = Query(None),
    situacao: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_PDI).filter(_FINEP)
    if ano_inicio:  q = q.filter(_PDI.ano_inicio == ano_inicio)
    if ano_termino: q = q.filter(_PDI.ano_fim == ano_termino)
    if centro:      q = q.filter(_PDI.centro.ilike(f"%{centro}%"))
    if natureza:    q = q.filter(_PDI.natureza.ilike(f"%{natureza}%"))
    if situacao:    q = q.filter(_PDI.situacao.ilike(f"%{situacao}%"))
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.ProjetoPDIOut)
def detalhe_finep(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    projeto = (
        db.query(_PDI)
        .filter(_PDI.id == id, _FINEP)
        .first()
    )
    if not projeto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado")
    return projeto
