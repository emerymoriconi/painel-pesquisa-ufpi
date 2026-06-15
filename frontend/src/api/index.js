import axios from 'axios'

const api = axios.create({
  baseURL: '',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const r = (res) => res.data

// Auth
export const login = (username, password) =>
  api.post('/api/auth/login', { username, password }).then(r)

// Dashboard
export const getKPIs = () => api.get('/api/dashboard/kpis').then(r)

// Projetos PDI
export const getProjetosPDI        = (params) => api.get('/api/projetos/pdi', { params }).then(r)
export const getKPIsProjetosPDI    = ()       => api.get('/api/projetos/pdi/kpis').then(r)
export const getPorAreaPDI         = ()       => api.get('/api/projetos/pdi/por-area').then(r)
export const getPorCentroPDI       = ()       => api.get('/api/projetos/pdi/por-centro').then(r)
export const getFiltrosPDI         = ()       => api.get('/api/projetos/pdi/filtros').then(r)

// Projetos FINEP
export const getProjetosFinep      = (params) => api.get('/api/finep', { params }).then(r)
export const getKPIsFinep          = ()       => api.get('/api/finep/kpis').then(r)
export const getRelacaoTipoFinep   = ()       => api.get('/api/finep/relacao-tipo').then(r)
export const getPorCentroFinep     = ()       => api.get('/api/finep/por-centro').then(r)
export const getFiltrosFinep       = ()       => api.get('/api/finep/filtros').then(r)

// Produção Intelectual
export const getProducaoAnual      = (params) => api.get('/api/producao/anual', { params }).then(r)
export const getTiposProducao      = ()       => api.get('/api/producao/anual/tipos').then(r)
export const getAnosProducao       = ()       => api.get('/api/producao/anual/anos').then(r)
export const getVitrine            = (params) => api.get('/api/producao/vitrine', { params }).then(r)
export const getKPIsProducao       = ()       => api.get('/api/producao/kpis').then(r)
export const getInventores         = ()       => api.get('/api/producao/vitrine/inventores').then(r)

// Bolsistas
export const getBolsistas          = (params) => api.get('/api/bolsistas', { params }).then(r)
export const getKPIsBolsistas      = ()       => api.get('/api/bolsistas/kpis').then(r)
export const getBolsistasPorCampus = ()       => api.get('/api/bolsistas/por-campus').then(r)
export const getFiltrosBolsistas   = ()       => api.get('/api/bolsistas/filtros').then(r)

// Núcleos
export const getNucleos            = (params) => api.get('/api/nucleos', { params }).then(r)
export const getKPIsNucleos        = ()       => api.get('/api/nucleos/kpis').then(r)
export const getNucleosPorCentro   = ()       => api.get('/api/nucleos/por-centro').then(r)
export const getFiltrosNucleos     = ()       => api.get('/api/nucleos/filtros').then(r)

// Grupos
export const getGrupos             = (params) => api.get('/api/grupos', { params }).then(r)
export const getKPIsGrupos         = ()       => api.get('/api/grupos/kpis').then(r)
export const getGruposPorArea      = ()       => api.get('/api/grupos/por-area').then(r)
export const getFiltrosGrupos      = ()       => api.get('/api/grupos/filtros').then(r)

// Incubadas
export const getIncubadas              = (params) => api.get('/api/incubadas', { params }).then(r)
export const getKPIsIncubadas          = ()       => api.get('/api/incubadas/kpis').then(r)
export const getIncubadasPorIncubadora = ()       => api.get('/api/incubadas/por-incubadora').then(r)
export const getFiltrosIncubadas       = ()       => api.get('/api/incubadas/filtros').then(r)

// Pós-Graduação
export const getPosGraduacao           = (params) => api.get('/api/pos-graduacao', { params }).then(r)
export const getKPIsPosGraduacao       = ()       => api.get('/api/pos-graduacao/kpis').then(r)
export const getPosGraduacaoPorCentro  = ()       => api.get('/api/pos-graduacao/por-centro').then(r)
export const getFiltrosPosGraduacao    = ()       => api.get('/api/pos-graduacao/filtros').then(r)

// Laboratórios
export const getLaboratorios           = (params) => api.get('/api/laboratorios', { params }).then(r)
export const getKPIsLaboratorios       = ()       => api.get('/api/laboratorios/kpis').then(r)
export const getLaboratoriosPorCentro  = ()       => api.get('/api/laboratorios/por-centro').then(r)
export const getFiltrosLaboratorios    = ()       => api.get('/api/laboratorios/filtros').then(r)

export default api
