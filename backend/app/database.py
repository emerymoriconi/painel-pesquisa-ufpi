from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

# Lê a URL do banco do .env
# Se não encontrar, usa um valor padrão (útil nos testes)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://painel:painel123@localhost:5432/pesquisa"
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base: classe base que todos os modelos (tabelas) vão herdar
# O SQLAlchemy usa isso para saber quais tabelas existem no banco
Base = declarative_base()