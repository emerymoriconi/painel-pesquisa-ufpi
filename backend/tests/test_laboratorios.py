def test_laboratorios_kpis_retorna_200(client):
    r = client.get("/laboratorios/kpis")
    assert r.status_code == 200


def test_laboratorios_kpis_campo_total(client):
    data = client.get("/laboratorios/kpis").json()
    assert "total" in data
    assert isinstance(data["total"], int)


def test_laboratorios_filtros_retorna_200(client):
    r = client.get("/laboratorios/filtros")
    assert r.status_code == 200


def test_laboratorios_filtros_campos(client):
    data = client.get("/laboratorios/filtros").json()
    for chave in ("nomes", "centros"):
        assert chave in data
        assert isinstance(data[chave], list)


def test_laboratorios_por_centro_retorna_200(client):
    r = client.get("/laboratorios/por-centro")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_laboratorios_por_centro_estrutura(client):
    itens = client.get("/laboratorios/por-centro").json()
    for item in itens:
        assert "centro" in item
        assert "total" in item


def test_laboratorios_lista_retorna_200(client):
    r = client.get("/laboratorios/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_laboratorios_lista_respeita_limit(client):
    r = client.get("/laboratorios/?limit=5")
    assert r.status_code == 200
    assert len(r.json()) <= 5


def test_laboratorios_filtro_nome_aceita_parametro(client):
    r = client.get("/laboratorios/?nome=Lab")
    assert r.status_code == 200


def test_laboratorios_detalhe_inexistente_retorna_404(client):
    r = client.get("/laboratorios/999999")
    assert r.status_code == 404


def test_laboratorios_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/laboratorios/")
    assert r.status_code == 401


def test_laboratorios_kpis_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/laboratorios/kpis")
    assert r.status_code == 401
