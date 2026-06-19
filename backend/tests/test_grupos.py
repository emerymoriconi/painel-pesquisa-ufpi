def test_grupos_kpis_retorna_200(client):
    r = client.get("/grupos/kpis")
    assert r.status_code == 200


def test_grupos_kpis_campo_total(client):
    data = client.get("/grupos/kpis").json()
    assert "total_grupos" in data
    assert isinstance(data["total_grupos"], int)


def test_grupos_filtros_retorna_200(client):
    r = client.get("/grupos/filtros")
    assert r.status_code == 200


def test_grupos_filtros_campos(client):
    data = client.get("/grupos/filtros").json()
    for chave in ("nomes", "areas", "anos_envio"):
        assert chave in data
        assert isinstance(data[chave], list)


def test_grupos_por_area_retorna_200(client):
    r = client.get("/grupos/por-area")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_grupos_lista_retorna_200(client):
    r = client.get("/grupos/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_grupos_lista_respeita_limit(client):
    r = client.get("/grupos/?limit=5")
    assert r.status_code == 200
    assert len(r.json()) <= 5


def test_grupos_filtro_area_aceita_parametro(client):
    r = client.get("/grupos/?area_predominante=Ciencias")
    assert r.status_code == 200


def test_grupos_detalhe_inexistente_retorna_404(client):
    r = client.get("/grupos/999999")
    assert r.status_code == 404


def test_grupos_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/grupos/")
    assert r.status_code == 401


def test_grupos_kpis_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/grupos/kpis")
    assert r.status_code == 401
