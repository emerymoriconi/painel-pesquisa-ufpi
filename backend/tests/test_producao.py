TIPOS_ESPERADOS = {"PATENTE", "SOFTWARE", "MARCA", "DESENHO INDUSTRIAL"}


def test_producao_kpis_retorna_200(client):
    r = client.get("/producao/kpis")
    assert r.status_code == 200


def test_producao_kpis_tem_todos_os_tipos(client):
    data = client.get("/producao/kpis").json()
    for tipo in TIPOS_ESPERADOS:
        assert tipo in data, f"Tipo ausente nos KPIs: {tipo}"


def test_anual_lista_retorna_200(client):
    r = client.get("/producao/anual")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_anual_filtro_tipo_aceita_parametro(client):
    r = client.get("/producao/anual?tipo=PATENTE")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_anual_filtro_ano_aceita_parametro(client):
    r = client.get("/producao/anual?ano=2023")
    assert r.status_code == 200


def test_anual_tipos_retorna_200(client):
    r = client.get("/producao/anual/tipos")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_anual_anos_retorna_200(client):
    r = client.get("/producao/anual/anos")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_vitrine_lista_retorna_200(client):
    r = client.get("/producao/vitrine")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_vitrine_lista_respeita_limit(client):
    r = client.get("/producao/vitrine?limit=5")
    assert r.status_code == 200
    assert len(r.json()) <= 5


def test_vitrine_filtro_tipo_aceita_parametro(client):
    r = client.get("/producao/vitrine?tipo=PATENTE")
    assert r.status_code == 200


def test_vitrine_inventores_retorna_200(client):
    r = client.get("/producao/vitrine/inventores")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_vitrine_detalhe_inexistente_retorna_404(client):
    r = client.get("/producao/vitrine/999999")
    assert r.status_code == 404


def test_producao_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/producao/anual")
    assert r.status_code == 401


def test_vitrine_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/producao/vitrine")
    assert r.status_code == 401
