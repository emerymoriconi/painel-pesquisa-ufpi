# Painel de Pesquisa, Desenvolvimento e Inovação — UFPI

Sistema web de dashboard analítico desenvolvido como TCC do
Bacharelado em Ciência da Computação da UFPI.

Converte o painel Power BI institucional em uma aplicação web
acessível via navegador, com autenticação, filtros interativos
e visualizações gráficas.

## Stack

- **Backend:** FastAPI + PostgreSQL + SQLAlchemy + Alembic
- **Frontend:** React + Vite + Recharts + Tailwind CSS
- **Infra:** Docker + Docker Compose + Nginx

## Como executar

### Pré-requisitos
- Docker Desktop instalado e rodando
- Arquivos xlsx em `backend/data/xlsx/`

### 1. Subir o sistema
```bash
docker compose up --build
```

### 2. Aplicar migrações (primeira vez)
```bash
docker compose exec api alembic upgrade head
```

### 3. Importar dados (primeira vez)
```bash
docker compose exec api python scripts/import_xlsx.py
```

### 4. Acessar
- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

### Credenciais padrão
- Usuário: `admin`
- Senha: definida via variável de ambiente `ADMIN_PASSWORD_HASH`

## Módulos

| Módulo | Descrição |
|--------|-----------|
| Home | KPIs gerais da instituição |
| Projetos PD&I | Projetos de pesquisa cadastrados |
| Projetos FINEP | Projetos financiados pela FINEP |
| Produção Intelectual | Patentes, softwares, marcas e desenhos |
| Bolsistas | Bolsistas de produtividade CNPq e UFPI |
| Núcleos de Pesquisa | Núcleos ativos e inativos |
| Grupos de Pesquisa | Grupos DGP/CNPq |
| Empresas Incubadas | Empresas em incubação |
| Pós-Graduação | Programas de pós-graduação |
| Laboratórios | Laboratórios PNIPE/MCTI |

## Testes

```bash
# Backend
cd backend
pytest tests/ -v --cov=app

# Frontend
cd frontend
npm test
```