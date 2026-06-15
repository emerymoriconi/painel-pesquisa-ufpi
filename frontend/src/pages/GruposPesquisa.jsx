import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsGrupos, getFiltrosGrupos,
  getGruposPorArea, getGrupos,
} from '../api/index.js'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'

const LIMITE = 20

const COLUNAS = [
  { key: 'nome_grupo',        label: 'NOME DO GRUPO' },
  { key: 'nome_lider',        label: 'NOME DO LÍDER' },
  { key: 'area_predominante', label: 'ÁREA PREDOMINANTE' },
  { key: 'ultimo_envio',      label: 'Último Envio' },
]

function toOpts(arr = []) {
  return arr.map((v) => ({ value: String(v), label: String(v) }))
}

// Card único grande — mesmo padrão do Bolsistas
function CardGrupos({ valor, loading }) {
  if (loading) return <SkeletonCard />
  return (
    <div className="h-full bg-azul-escuro text-white rounded-xl px-6 py-10 flex flex-col items-center justify-center text-center">
      <p className="text-lg font-bold uppercase tracking-wide opacity-80 leading-tight">
        Grupos de Pesquisa
      </p>
      <span className="text-4xl mt-3">👥</span>
      <p className="text-6xl font-bold mt-3">{valor ?? '—'}</p>
    </div>
  )
}

export default function GruposPesquisa() {
  const [kpis,         setKpis]         = useState({})
  const [opcoes,       setOpcoes]       = useState({})
  const [dadosPorArea, setDadosPorArea] = useState([])
  const [grupos,       setGrupos]       = useState([])
  const [pagina,       setPagina]       = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  const [filtroNome, setFiltroNome] = useState('')
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroAno,  setFiltroAno]  = useState('')

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)
  const [loadingTabela,  setLoadingTabela]  = useState(true)

  const refGrafico = useRef(null)

  const filtrosAtivos = {
    nome_grupo:        filtroNome || undefined,
    area_predominante: filtroArea || undefined,
    ultimo_envio:      filtroAno  || undefined,
  }

  // Dados estáticos — mount apenas
  useEffect(() => {
    getKPIsGrupos()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setLoadingKpis(false))

    getFiltrosGrupos()
      .then(setOpcoes)
      .catch(() => {})
  }, [])

  // Gráfico — recarrega quando filtros mudam
  useEffect(() => {
    setLoadingGrafico(true)
    getGruposPorArea(filtrosAtivos)
      .then((data) => setDadosPorArea(Array.isArray(data) ? data.slice(0, 10) : []))
      .catch(() => {})
      .finally(() => setLoadingGrafico(false))
  }, [filtroNome, filtroArea, filtroAno]) // eslint-disable-line

  // Tabela — recarrega quando filtros ou página mudam
  useEffect(() => {
    setLoadingTabela(true)
    getGrupos({ ...filtrosAtivos, skip: (pagina - 1) * LIMITE, limit: LIMITE })
      .then((data) => {
        if (Array.isArray(data)) {
          setGrupos(data)
          setTotalPaginas(1)
        } else {
          setGrupos(data.items ?? [])
          setTotalPaginas(Math.max(1, Math.ceil((data.total ?? 0) / LIMITE)))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroNome, filtroArea, filtroAno, pagina]) // eslint-disable-line

  function comReset(setter) {
    return (val) => { setter(val); setPagina(1) }
  }

  function limparFiltros() {
    setFiltroNome('')
    setFiltroArea('')
    setFiltroAno('')
    setPagina(1)
  }

  return (
    <div className="space-y-6">

      {/* ── Top: Card + Gráfico + Filtros ──────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">

        {/* Card único */}
        <div className="lg:w-52 flex-shrink-0">
          <CardGrupos valor={kpis.total_grupos} loading={loadingKpis} />
        </div>

        {/* Gráfico barras horizontais */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div ref={refGrafico}>
            <h3 className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 mb-2">
              Nº de Grupos por Área Predominante
            </h3>
            {loadingGrafico ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                Carregando…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart
                  data={dadosPorArea}
                  layout="vertical"
                  margin={{ top: 4, right: 28, left: 0, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <YAxis
                    type="category"
                    dataKey="area"
                    width={120}
                    tick={{ fontSize: 10 }}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    label={{
                      value: 'N° DE GRUPOS',
                      position: 'insideBottom',
                      offset: -12,
                      fontSize: 10,
                      fill: '#6B7280',
                    }}
                  />
                  <Tooltip content={<TooltipGrafico />} />
                  <Bar dataKey="total" fill="#2E5F8A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="grupos_por_area" />
          </div>
        </div>

        {/* Filtros — coluna direita */}
        <div className="lg:w-48 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3 lg:sticky lg:top-4">
            <FiltroSelect
              label="Nome do Grupo"
              value={filtroNome}
              onChange={comReset(setFiltroNome)}
              options={toOpts(opcoes.nomes)}
            />
            <FiltroSelect
              label="Área de Conhecimento"
              value={filtroArea}
              onChange={comReset(setFiltroArea)}
              options={toOpts(opcoes.areas)}
            />
            <FiltroSelect
              label="Ano de Atualização"
              value={filtroAno}
              onChange={comReset(setFiltroAno)}
              options={toOpts(opcoes.anos_envio)}
            />
            <BotaoLimparFiltros onClick={limparFiltros} />
          </div>
        </div>
      </div>

      {/* ── Tabela full-width ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Informações dos Grupos de Pesquisas
          </h3>
          <BotaoExportarCSV
            dados={grupos}
            nomeArquivo="grupos"
            colunas={COLUNAS}
          />
        </div>
        <TabelaPaginada
          colunas={COLUNAS}
          dados={grupos}
          pagina={pagina}
          totalPaginas={totalPaginas}
          onAnterior={() => setPagina((p) => p - 1)}
          onProxima={() => setPagina((p) => p + 1)}
          loading={loadingTabela}
        />
      </div>
    </div>
  )
}
