from pydantic import BaseModel
from datetime import date

class ProjetoPDIOut(BaseModel):
    id: int
    registro: str | None = None
    titulo: str                          # Coluna 'PROJETOS'
    coordenador: str | None = None       # Coluna 'COORDENADORES'
    natureza: str | None = None
    area: str | None = None              # Coluna 'ÁREA DO CONHECIMENTO'
    centro: str | None = None
    modalidade: str | None = None
    agencia_fomento: str | None = None   # Coluna 'AGÊNCIA DE FOMENTO'
    valor_total: float | None = None
    ano_inicio: int | None = None        # Coluna 'ANO-I'
    ano_fim: int | None = None           # Coluna 'ANO-F'
    situacao: str | None = None          # Coluna 'SITUAÇÃO'

    model_config = {"from_attributes": True}


class ProjetoFinepOut(BaseModel):
    """Mapeia os dados da tabela projetos_finep"""
    id: int
    titulo: str          # Coluna 'Projeto'
    edital: str | None = None  # Coluna 'Edital/Chamada'
    linha_area: str | None = None  # Coluna 'Linha/Área'
    valor: float | None = None
    status: str | None = None  # Coluna 'Situação'
    coordenador: str | None = None

    model_config = {"from_attributes": True}
    

class VitrineProducaoOut(BaseModel):
    """Mapeia os dados reais e detalhados da aba Vitrine do MEC"""
    id: int
    pedido: str | None = None
    deposito: date | None = None  # Formato YYYY-MM-DD
    concessao: date | None = None
    titulo: str
    descricao: str | None = None
    diferencial_tecnologico: str | None = None
    inventores: str | None = None
    tipo: str  # SOFTWARE, PATENTE, etc.
    ano: int | None = None

    model_config = {"from_attributes": True}


class ProducaoAnualOut(BaseModel):
    """Mapeia os históricos de contagem para os gráficos do painel"""
    id: int
    ano: int
    tipo: str  # PATENTE, SOFTWARE, MARCA, DESENHO INDUSTRIAL
    depositadas: int = 0
    concedidas: int = 0
    pendencias: int = 0
    co_titularidade: int = 0
    arquivadas: int = 0
    anuladas: int = 0
    andamento_ufpi: int = 0

    model_config = {"from_attributes": True}


class BolsistaOut(BaseModel):
    """Mapeia os dados da tabela bolsistas"""
    id: int
    nome: str
    nivel: str | None = None
    modalidade: str | None = None 
    campus_centro: str | None = None 
    orgao: str | None = None 

    model_config = {"from_attributes": True}


class NucleoPesquisaOut(BaseModel):
    id: int
    denominacao: str
    situacao: str | None = None
    centro_campus: str | None = None
    vinculacao: str | None = None
    ano_resolucao: int | None = None
    coordenador: str | None = None

    model_config = {"from_attributes": True}



class GrupoPesquisaOut(BaseModel):
    id: int                     # Campo gerado pelo banco ou mapeado do loop
    nome_grupo: str             # Coluna 'NOME DO GRUPO'
    nome_lider: str | None = None # Coluna 'NOME DO LÍDER'
    instituicao: str | None = None # Coluna 'INSTITUIÇÃO'
    area_predominante: str | None = None # Coluna 'ÁREA PREDOMINANTE'
    ultimo_envio: str | None = None # Coluna 'Último Envio' (Pode tratar como string ou data se preferir)
    status: str | None = None   # Coluna 'SITUAÇÃO' (Ex: Certificado)
    link_acesso: str | None = None # Coluna 'Link de Acesso'

    model_config = {"from_attributes": True}


class EmpresaIncubadaOut(BaseModel):
    id: int
    nome_projeto: str           # Coluna 'Nome dos projetos incubados'
    tipo_produto_servico: str | None = None # Coluna 'Tipo de produto/serviços desenvolvidos'
    objetivo: str | None = None  # Coluna 'Objetivo'
    equipe_projeto: str | None = None # Coluna 'Equipe do Projeto'
    departamento_coordenador: str | None = None # Coluna 'Departamentos dos Coordenadores'
    cidade_estado: str | None = None # Coluna 'Cidade/Estado'
    periodo_inicio: str | None = None # Coluna 'Período de início de incubação do projeto'
    periodo_final: str | None = None  # Coluna 'Período final de incubação do projeto'
    tipo_empresa: str | None = None  # Coluna 'Tipo de Empresas'
    contato: str | None = None       # Coluna 'Contato'
    investimento: str | None = None  # Coluna 'Investimento'
    incubadora: str | None = None    # Coluna 'Incubadora'
    graduada: str | None = None

    model_config = {"from_attributes": True}


class PosGraduacaoOut(BaseModel):
    id: int                     # Coluna 'ITEM'
    codigo_curso: str | None = None # Coluna 'CODIGO CURSO'
    programa: str               # Coluna 'PROGRAMA'
    nome_curso: str | None = None # Coluna 'NOME DO CURSO'
    fone: str | None = None     # Coluna 'FONE'
    email: str | None = None    # Coluna 'EMAIL'
    centro: str | None = None   # Coluna 'CENTRO'
    tipo: str | None = None     # Coluna 'TIPO'
    modalidade: str | None = None # Coluna 'MODALIDADE'
    nivel: str | None = None    # Coluna 'NÍVEL' (Ex: Mestrado / Doutorado)
    conceito_capes: int | None = None # Coluna 'CONCEITO CAPES\n(*Os que possuem)'

    model_config = {"from_attributes": True}


class LaboratorioOut(BaseModel):
    id: int                     # Gerado sequencialmente pelo banco
    nome: str                   # Coluna 'NOME'
    sigla: str | None = None    # Coluna 'SIGLA'
    centro_campi: str | None = None # Coluna 'CENTRO/CAMPI'
    endereco: str | None = None # Coluna 'ENDEREÇO'
    responsavel: str | None = None # Coluna 'RESPONSÁVEL'
    email: str | None = None    # Coluna 'EMAIL'
    site: str | None = None     # Coluna 'SITE'

    model_config = {"from_attributes": True}


class KPIsOut(BaseModel):
    """Resumo geral para a página Home"""
    total_projetos_pdi: int
    total_projetos_finep: float
    total_producao_intelectual: int
    total_bolsistas: int
    total_nucleos: int
    total_grupos: int
    total_incubadas: int
    total_pos_graduacao: int
    total_laboratorios: int
    ultima_atualizacao: str

    model_config = {"from_attributes": True}