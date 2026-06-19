def test_pos_kpis_retorna_200(client):
    r = client.get("/pos-graduacao/kpis")
    assert r.status_code == 200


def test_pos_kpis_campo_total(client):
    data = client.get("/pos-graduacao/kpis").json()
    assert "total_pos_graduacao" in data
    assert isinstance(data["total_pos_graduacao"], int)


def test_pos_filtros_retorna_200(client):
    r = client.get("/pos-graduacao/filtros")
    assert r.status_code == 200


def test_pos_filtros_campos(client):
    data = client.get("/pos-graduacao/filtros").json()
    for chave in ("programas", "conceitos_capes", "centros", "niveis", "tipos"):
        assert chave in data
        assert isinstance(data[chave], list)


def test_pos_por_centro_retorna_200(client):
    r = client.get("/pos-graduacao/por-centro")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_pos_lista_retorna_200(client):
    r = client.get("/pos-graduacao/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_pos_lista_respeita_limit(client):
    r = client.get("/pos-graduacao/?limit=5")
    assert r.status_code == 200
    assert len(r.json()) <= 5


def test_pos_filtro_nivel_aceita_parametro(client):
    r = client.get("/pos-graduacao/?nivel=Mestrado")
    assert r.status_code == 200


def test_pos_filtro_conceito_capes_aceita_parametro(client):
    r = client.get("/pos-graduacao/?conceito_capes=4")
    assert r.status_code == 200


def test_pos_detalhe_inexistente_retorna_404(client):
    r = client.get("/pos-graduacao/999999")
    assert r.status_code == 404


def test_pos_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/pos-graduacao/")
    assert r.status_code == 401


def test_pos_kpis_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/pos-graduacao/kpis")
    assert r.status_code == 401
