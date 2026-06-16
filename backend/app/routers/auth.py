from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth import (
    ADMIN_USERNAME,
    ADMIN_PASSWORD_HASH,
    LoginForm,
    Token,
    criar_token,
    verificar_autenticacao,
    verificar_senha,
    gerar_hash,
)
from app.dependencies import get_db
from app.models import Usuario

router = APIRouter(prefix="/auth", tags=["Autenticação"])


class CadastroForm(BaseModel):
    username: str
    password: str


@router.post("/login", response_model=Token)
def login(form: LoginForm, db: Session = Depends(get_db)):
    # Verifica admin configurado via variável de ambiente
    if (
        ADMIN_PASSWORD_HASH
        and form.username == ADMIN_USERNAME
        and verificar_senha(form.password, ADMIN_PASSWORD_HASH)
    ):
        return Token(access_token=criar_token({"sub": form.username}))

    # Verifica usuários cadastrados no banco
    usuario = db.query(Usuario).filter(Usuario.username == form.username).first()
    if usuario and verificar_senha(form.password, usuario.senha_hash):
        return Token(access_token=criar_token({"sub": form.username}))

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/cadastro", status_code=201)
def cadastro(form: CadastroForm, db: Session = Depends(get_db)):
    if len(form.username.strip()) < 3:
        raise HTTPException(status_code=400, detail="Usuário deve ter pelo menos 3 caracteres")
    if len(form.password) < 6:
        raise HTTPException(status_code=400, detail="Senha deve ter pelo menos 6 caracteres")
    if form.username == ADMIN_USERNAME:
        raise HTTPException(status_code=400, detail="Nome de usuário indisponível")

    existente = db.query(Usuario).filter(Usuario.username == form.username).first()
    if existente:
        raise HTTPException(status_code=400, detail="Usuário já cadastrado")

    db.add(Usuario(username=form.username.strip(), senha_hash=gerar_hash(form.password)))
    db.commit()
    return {"mensagem": "Usuário cadastrado com sucesso"}


@router.get("/me")
def me(payload: dict = Depends(verificar_autenticacao)):
    return {"username": payload["sub"]}
