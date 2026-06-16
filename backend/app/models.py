from sqlalchemy import Column, Integer, String, Text, Date, Float
from app.database import Base

class ProjetoPDI(Base):
    """Alinhado com PROJETOS_PDI.xlsx — aba BancoDeProjetosPesquisaCPESI"""
    __tablename__ = "projetos_pdi"

    id = Column(Integer, primary_key=True, index=True)
    registro = Column(String, nullable=True)         # ex: 'CPCE-020-2015'
    titulo = Column(String, nullable=False)           # Coluna 'PROJETOS'
    coordenador = Column(String, nullable=True)       # Coluna 'COORDENADORES'
    natureza = Column(String, nullable=True)          # ex: 'Pesquisa científica'
    area = Column(String, nullable=True)              # Coluna 'ÁREA DO CONHECIMENTO'
    centro = Column(String, nullable=True)            # ex: 'CCA', 'CCHL'
    modalidade = Column(String, nullable=True)        # ex: 'Projeto interno'
    agencia_fomento = Column(String, nullable=True)   # Coluna 'AGÊNCIA DE FOMENTO'
    valor_total = Column(Float, nullable=True)
    ano_inicio = Column(Integer, nullable=True)       # Coluna 'ANO-I'
    ano_fim = Column(Integer, nullable=True)          # Coluna 'ANO-F'
    situacao = Column(String, nullable=True)          # ex: 'Em andamento', 'Concluído'


class ProjetoFinep(Base):
    """Alinhado com a planilha Projetos_FINEP.xlsx"""
    __tablename__ = "projetos_finep"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    edital = Column(String, nullable=True)
    linha_area = Column(String, nullable=True)
    valor = Column(Float, nullable=True)
    status = Column(String, nullable=True)
    coordenador = Column(String, nullable=True)


class VitrineProducao(Base):
    """Reflete os dados analíticos reais da aba 'VITRINE DO MEC'"""
    __tablename__ = "propriedades_intelectuais_detalhado"

    id = Column(Integer, primary_key=True, index=True)
    pedido = Column(String, nullable=True)
    deposito = Column(Date, nullable=True)
    concessao = Column(Date, nullable=True)
    titulo = Column(String, nullable=False)
    descricao = Column(Text, nullable=True)
    diferencial_tecnologico = Column(Text, nullable=True)
    inventores = Column(Text, nullable=True)
    tipo = Column(String, nullable=False)  # SOFTWARE, PATENTE, MARCA, etc.
    ano = Column(Integer, nullable=True)


class ProducaoAnual(Base):
    """Reflete os históricos de contagens das abas de produção anual"""
    __tablename__ = "metricas_producao_anual"

    id = Column(Integer, primary_key=True, index=True)
    ano = Column(Integer, nullable=False)
    tipo = Column(String, nullable=False)  # PATENTE, SOFTWARE, MARCA, etc.
    depositadas = Column(Integer, default=0, nullable=False)
    concedidas = Column(Integer, default=0, nullable=False)
    pendencias = Column(Integer, default=0, nullable=False)
    co_titularidade = Column(Integer, default=0, nullable=False)
    arquivadas = Column(Integer, default=0, nullable=False)
    anuladas = Column(Integer, default=0, nullable=False)
    andamento_ufpi = Column(Integer, default=0, nullable=False)


class Bolsista(Base):
    """Alinhado com a planilha Bolsistas_Produtividade.xlsx"""
    __tablename__ = "bolsistas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    nivel = Column(String, nullable=True)
    modalidade = Column(String, nullable=True)
    campus_centro = Column(String, nullable=True)
    orgao = Column(String, nullable=True)


class NucleoPesquisa(Base):
    __tablename__ = "nucleos_pesquisa"

    id = Column(Integer, primary_key=True, index=True)  # Campo 'N.'
    denominacao = Column(Text, nullable=False)
    situacao = Column(String, nullable=True)             # Campo 'SITUAÇÃO'
    centro_campus = Column(String, nullable=True)        # Campo 'CENTRO/CAMPUS/PRÓ-REITORIA'
    vinculacao = Column(Text, nullable=True)
    ano_resolucao = Column(Integer, nullable=True)
    coordenador = Column(String, nullable=True)


class GrupoPesquisa(Base):
    __tablename__ = "grupos_pesquisa"

    id = Column(Integer, primary_key=True, index=True)
    nome_grupo = Column(Text, nullable=False)
    nome_lider = Column(String, nullable=True)
    instituicao = Column(String, nullable=True)
    area_predominante = Column(String, nullable=True)
    ultimo_envio = Column(String, nullable=True)
    status = Column(String, nullable=True)
    link_acesso = Column(Text, nullable=True)


class EmpresaIncubada(Base):
    __tablename__ = "empresas_incubadas"

    id = Column(Integer, primary_key=True, index=True)
    nome_projeto = Column(Text, nullable=False)
    tipo_produto_servico = Column(Text, nullable=True)
    objetivo = Column(Text, nullable=True)
    equipe_projeto = Column(Text, nullable=True)
    departamento_coordenador = Column(Text, nullable=True)
    cidade_estado = Column(String, nullable=True)
    periodo_inicio = Column(String, nullable=True)
    periodo_final = Column(String, nullable=True)
    tipo_empresa = Column(String, nullable=True)
    contato = Column(Text, nullable=True)
    investimento = Column(String, nullable=True)
    incubadora = Column(String, nullable=True)
    graduada = Column(String, nullable=True)


class PosGraduacao(Base):
    __tablename__ = "pos_graduacao"

    id = Column(Integer, primary_key=True, index=True) # Mapeia o 'ITEM'
    codigo_curso = Column(String, nullable=True)
    programa = Column(Text, nullable=False)
    nome_curso = Column(Text, nullable=True)
    fone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    centro = Column(String, nullable=True)
    tipo = Column(String, nullable=True)
    modalidade = Column(String, nullable=True)
    nivel = Column(String, nullable=True)
    conceito_capes = Column(Integer, nullable=True)


class Laboratorio(Base):
    __tablename__ = "laboratorios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(Text, nullable=False)
    sigla = Column(String, nullable=True)
    centro_campi = Column(String, nullable=True)
    endereco = Column(Text, nullable=True)
    responsavel = Column(String, nullable=True)
    email = Column(String, nullable=True)
    site = Column(Text, nullable=True)


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    senha_hash = Column(String, nullable=False)