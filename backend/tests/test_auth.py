def test_login_usuario_invalido_retorna_401(client):
    r = client.post("/auth/login", json={"username": "usuario_errado", "password": "senha_errada"})
    assert r.status_code == 401


def test_login_campos_obrigatorios(client):
    r = client.post("/auth/login", json={})
    assert r.status_code == 422


def test_me_sem_token_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/auth/me")
    assert r.status_code == 401


def test_me_com_auth_retorna_username(client):
    r = client.get("/auth/me")
    assert r.status_code == 200
    assert r.json()["username"] == "admin"
