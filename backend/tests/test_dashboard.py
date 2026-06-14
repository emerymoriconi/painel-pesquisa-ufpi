CAMPOS_KPIS = [
    "total_projetos_pdi",
    "total_projetos_finep",
    "total_producao_intelectual",
    "total_bolsistas",
    "total_nucleos",
    "total_grupos",
    "total_incubadas",
    "total_pos_graduacao",
    "total_laboratorios",
    "ultima_atualizacao",
]


def test_kpis_retorna_200(client):
    r = client.get("/dashboard/kpis")
    assert r.status_code == 200


def test_kpis_tem_todos_os_campos(client):
    data = client.get("/dashboard/kpis").json()
    for campo in CAMPOS_KPIS:
        assert campo in data, f"Campo ausente: {campo}"


_CAMPOS_INT = [
    "total_projetos_pdi",
    "total_producao_intelectual",
    "total_bolsistas",
    "total_nucleos",
    "total_grupos",
    "total_incubadas",
    "total_pos_graduacao",
    "total_laboratorios",
]


def test_kpis_valores_numericos(client):
    data = client.get("/dashboard/kpis").json()
    for campo in _CAMPOS_INT:
        assert isinstance(data[campo], int), f"{campo} deveria ser int"
    assert isinstance(data["total_projetos_finep"], float)
    assert isinstance(data["ultima_atualizacao"], str)


def test_kpis_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/dashboard/kpis")
    assert r.status_code == 401
