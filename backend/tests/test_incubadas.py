def test_incubadas_kpis_retorna_200(client):
    r = client.get("/incubadas/kpis")
    assert r.status_code == 200


def test_incubadas_kpis_campos(client):
    data = client.get("/incubadas/kpis").json()
    assert "total_incubadas" in data
    assert "graduadas" in data
    assert "total_incubadoras" in data


def test_incubadas_filtros_retorna_200(client):
    r = client.get("/incubadas/filtros")
    assert r.status_code == 200


def test_incubadas_filtros_campos(client):
    data = client.get("/incubadas/filtros").json()
    for chave in ("incubadoras", "situacoes"):
        assert chave in data
        assert isinstance(data[chave], list)


def test_incubadas_por_incubadora_retorna_200(client):
    r = client.get("/incubadas/por-incubadora")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_incubadas_lista_retorna_200(client):
    r = client.get("/incubadas/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_incubadas_lista_respeita_limit(client):
    r = client.get("/incubadas/?limit=5")
    assert r.status_code == 200
    assert len(r.json()) <= 5


def test_incubadas_filtro_incubadora_aceita_parametro(client):
    r = client.get("/incubadas/?incubadora=INBATE")
    assert r.status_code == 200


def test_incubadas_detalhe_inexistente_retorna_404(client):
    r = client.get("/incubadas/999999")
    assert r.status_code == 404


def test_incubadas_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/incubadas/")
    assert r.status_code == 401


def test_incubadas_kpis_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/incubadas/kpis")
    assert r.status_code == 401
