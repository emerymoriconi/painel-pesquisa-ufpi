from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import (
    ADMIN_USERNAME,
    ADMIN_PASSWORD_HASH,
    LoginForm,
    Token,
    criar_token,
    verificar_autenticacao,
    verificar_senha,
)

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=Token)
def login(form: LoginForm):
    if form.username != ADMIN_USERNAME or not verificar_senha(form.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(access_token=criar_token({"sub": form.username}))


@router.get("/me")
def me(payload: dict = Depends(verificar_autenticacao)):
    return {"username": payload["sub"]}
