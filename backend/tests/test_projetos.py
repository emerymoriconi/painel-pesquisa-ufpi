# Nota: projetos FINEP estão em /finep/ (não /projetos/finep/).
# O router finep.py usa prefix="/finep" e lista projetos de projetos_pdi
# filtrados por agencia_fomento ilike "FINEP" (match exato, case-insensitive).


# ── PDI ───────────────────────────────────────────────────────────────────────

def test_pdi_kpis_retorna_200(client):
    r = client.get("/projetos/pdi/kpis")
    assert r.status_code == 200


def test_pdi_kpis_campos(client):
    data = client.get("/projetos/pdi/kpis").json()
    assert "concluidos" in data
    assert "em_andamento" in data


def test_pdi_filtros_retorna_200(client):
    r = client.get("/projetos/pdi/filtros")
    assert r.status_code == 200


def test_pdi_filtros_campos(client):
    data = client.get("/projetos/pdi/filtros").json()
    for chave in ("anos_inicio", "anos_termino", "centros", "naturezas", "areas", "situacoes"):
        assert chave in data, f"Chave ausente em filtros: {chave}"
        assert isinstance(data[chave], list)


def test_pdi_por_area_retorna_200(client):
    r = client.get("/projetos/pdi/por-area")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_pdi_por_centro_retorna_200(client):
    r = client.get("/projetos/pdi/por-centro")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_pdi_lista_retorna_200(client):
    r = client.get("/projetos/pdi")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_pdi_lista_respeita_limit(client):
    r = client.get("/projetos/pdi?limit=5")
    assert r.status_code == 200
    assert len(r.json()) <= 5


def test_pdi_filtro_situacao_aceita_parametro(client):
    r = client.get("/projetos/pdi?situacao=concluido")
    assert r.status_code == 200


def test_pdi_filtro_centro_aceita_parametro(client):
    r = client.get("/projetos/pdi?centro=CCA")
    assert r.status_code == 200


def test_pdi_detalhe_inexistente_retorna_404(client):
    r = client.get("/projetos/pdi/999999")
    assert r.status_code == 404


def test_pdi_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/projetos/pdi")
    assert r.status_code == 401


def test_pdi_kpis_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/projetos/pdi/kpis")
    assert r.status_code == 401


# ── FINEP ─────────────────────────────────────────────────────────────────────

def test_finep_kpis_retorna_200(client):
    r = client.get("/finep/kpis")
    assert r.status_code == 200


def test_finep_kpis_campos(client):
    data = client.get("/finep/kpis").json()
    assert "valor_total_mi" in data
    assert "total_projetos" in data


def test_finep_filtros_retorna_200(client):
    r = client.get("/finep/filtros")
    assert r.status_code == 200


def test_finep_filtros_campos(client):
    data = client.get("/finep/filtros").json()
    for chave in ("anos_inicio", "anos_termino", "centros", "naturezas", "situacoes"):
        assert chave in data
        assert isinstance(data[chave], list)


def test_finep_relacao_tipo_retorna_200(client):
    r = client.get("/finep/relacao-tipo")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_finep_por_centro_retorna_200(client):
    r = client.get("/finep/por-centro")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_finep_lista_retorna_200(client):
    r = client.get("/finep")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_finep_lista_respeita_limit(client):
    r = client.get("/finep?limit=5")
    assert r.status_code == 200
    assert len(r.json()) <= 5


def test_finep_detalhe_inexistente_retorna_404(client):
    r = client.get("/finep/999999")
    assert r.status_code == 404


def test_finep_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/finep")
    assert r.status_code == 401
