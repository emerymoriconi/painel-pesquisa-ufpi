from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import projetos, dashboard, auth, finep, producao, bolsistas, nucleos, grupos, incubadas, pos_graduacao, laboratorios

app = FastAPI(
    title="Painel de Pesquisa e Inovação",
    description="API REST do sistema de indicadores de P&D da instituição",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projetos.router)
app.include_router(finep.router)
app.include_router(dashboard.router)
app.include_router(producao.router)
app.include_router(bolsistas.router)
app.include_router(nucleos.router)
app.include_router(grupos.router)
app.include_router(incubadas.router)
app.include_router(pos_graduacao.router)
app.include_router(laboratorios.router)


@app.get("/health", tags=["Sistema"])
def health_check():
    """Verifica se a API está no ar."""
    return {"status": "ok", "versao": "1.0.0"}
