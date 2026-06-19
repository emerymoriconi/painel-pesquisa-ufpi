def test_nucleos_kpis_retorna_200(client):
    r = client.get("/nucleos/kpis")
    assert r.status_code == 200


def test_nucleos_kpis_campos(client):
    data = client.get("/nucleos/kpis").json()
    assert "total_nucleos" in data
    assert "total_ativos" in data
    assert "total_inativos" in data


def test_nucleos_filtros_retorna_200(client):
    r = client.get("/nucleos/filtros")
    assert r.status_code == 200


def test_nucleos_filtros_campos(client):
    data = client.get("/nucleos/filtros").json()
    for chave in ("centros", "vinculacoes", "anos", "nucleos"):
        assert chave in data
        assert isinstance(data[chave], list)


def test_nucleos_por_centro_retorna_200(client):
    r = client.get("/nucleos/por-centro")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_nucleos_lista_retorna_200(client):
    r = client.get("/nucleos/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_nucleos_lista_respeita_limit(client):
    r = client.get("/nucleos/?limit=5")
    assert r.status_code == 200
    assert len(r.json()) <= 5


def test_nucleos_filtro_situacao_aceita_parametro(client):
    r = client.get("/nucleos/?situacao=ativo")
    assert r.status_code == 200


def test_nucleos_detalhe_inexistente_retorna_404(client):
    r = client.get("/nucleos/999999")
    assert r.status_code == 404


def test_nucleos_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/nucleos/")
    assert r.status_code == 401


def test_nucleos_kpis_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/nucleos/kpis")
    assert r.status_code == 401
