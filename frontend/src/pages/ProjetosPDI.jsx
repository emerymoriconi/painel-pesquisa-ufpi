import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  getKPIsProjetosPDI, getFiltrosPDI,
  getPorAreaPDI, getPorCentroPDI, getProjetosPDI,
} from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'

const LIMITE = 20

const COLUNAS = [
  { key: 'area',        label: 'ÁREA DO CONHECIMENTO' },
  { key: 'centro',      label: 'CENTRO' },
  { key: 'coordenador', label: 'COORDENADORES' },
  { key: 'natureza',    label: 'NATUREZA' },
  { key: 'titulo',      label: 'PROJETOS' },
  { key: 'situacao',    label: 'SITUAÇÃO' },
]

// Tick do eixo X com rótulo rotacionado e truncado
function TickRotacionado({ x, y, payload }) {
  const texto =
    typeof payload.value === 'string' && payload.value.length > 15
      ? payload.value.slice(0, 15) + '…'
      : payload.value
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={0} dy={12}
        textAnchor="end"
        fill="#6B7280"
        fontSize={10}
        transform="rotate(-35)"
      >
        {texto}
      </text>
    </g>
  )
}

// Formata valores grandes como "1,2 Mil"
function formatarEixoY(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace('.', ',')} Mil`
  return String(v)
}

function toOpts(arr = []) {
  return arr.map((v) => ({ value: String(v), label: String(v) }))
}

export default function ProjetosPDI() {
  const [kpis,          setKpis]          = useState({})
  const [opcoes,        setOpcoes]        = useState({})
  const [dadosPorArea,  setDadosPorArea]  = useState([])
  const [dadosPorCentro, setDadosPorCentro] = useState([])
  const [projetos,      setProjetos]      = useState([])
  const [pagina,        setPagina]        = useState(1)
  const [totalPaginas,  setTotalPaginas]  = useState(1)

  const [filtroAnoInicio,  setFiltroAnoInicio]  = useState('')
  const [filtroAnoTermino, setFiltroAnoTermino] = useState('')
  const [filtroCentro,     setFiltroCentro]     = useState('')
  const [filtroNatureza,   setFiltroNatureza]   = useState('')
  const [filtroArea,       setFiltroArea]       = useState('')
  const [filtroSituacao,   setFiltroSituacao]   = useState('')

  const [loadingKpis,     setLoadingKpis]     = useState(true)
  const [loadingGraficos, setLoadingGraficos] = useState(true)
  const [loadingTabela,   setLoadingTabela]   = useState(true)

  const refGraficoArea   = useRef(null)
  const refGraficoCentro = useRef(null)

  const filtrosAtivos = {
    ano_inicio:  filtroAnoInicio  || undefined,
    ano_termino: filtroAnoTermino || undefined,
    centro:      filtroCentro     || undefined,
    natureza:    filtroNatureza   || undefined,
    area:        filtroArea       || undefined,
    situacao:    filtroSituacao   || undefined,
  }

  // KPIs + opções de filtro — somente no mount
  useEffect(() => {
    getKPIsProjetosPDI()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setLoadingKpis(false))

    getFiltrosPDI()
      .then(setOpcoes)
      .catch(() => {})
  }, [])

  // Gráficos — recarrega quando filtros mudam
  useEffect(() => {
    setLoadingGraficos(true)
    Promise.all([
      getPorAreaPDI(filtrosAtivos),
      getPorCentroPDI(filtrosAtivos),
    ])
      .then(([area, centro]) => {
        setDadosPorArea(area)
        setDadosPorCentro(centro)
      })
      .catch(() => {})
      .finally(() => setLoadingGraficos(false))
  }, [filtroAnoInicio, filtroAnoTermino, filtroCentro, filtroNatureza, filtroArea, filtroSituacao]) // eslint-disable-line

  // Tabela — recarrega quando filtros ou página mudam
  useEffect(() => {
    setLoadingTabela(true)
    getProjetosPDI({ ...filtrosAtivos, skip: (pagina - 1) * LIMITE, limit: LIMITE })
      .then((data) => {
        if (Array.isArray(data)) {
          setProjetos(data)
          setTotalPaginas(1)
        } else {
          setProjetos(data.items ?? [])
          setTotalPaginas(Math.max(1, Math.ceil((data.total ?? 0) / LIMITE)))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroAnoInicio, filtroAnoTermino, filtroCentro, filtroNatureza, filtroArea, filtroSituacao, pagina]) // eslint-disable-line

  function comReset(setter) {
    return (val) => { setter(val); setPagina(1) }
  }

  function limparFiltros() {
    setFiltroAnoInicio('')
    setFiltroAnoTermino('')
    setFiltroCentro('')
    setFiltroNatureza('')
    setFiltroArea('')
    setFiltroSituacao('')
    setPagina(1)
  }

  return (
    <div className="space-y-6">

      {/* ── Linha 1: KPI Cards + Filtros ───────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Cards */}
        <div className="grid grid-cols-2 gap-4 lg:w-72 flex-shrink-0">
          {loadingKpis ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <CardMetrica
                titulo="Projetos Concluídos"
                valor={kpis.total_concluidos}
                icone="✅"
              />
              <CardMetrica
                titulo="Projetos em Andamento"
                valor={kpis.total_em_andamento}
                icone="⚙️"
              />
            </>
          )}
        </div>

        {/* Filtros */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            <FiltroSelect
              label="Ano de Início"
              value={filtroAnoInicio}
              onChange={comReset(setFiltroAnoInicio)}
              options={toOpts(opcoes.anos_inicio)}
            />
            <FiltroSelect
              label="Centro/Campi"
              value={filtroCentro}
              onChange={comReset(setFiltroCentro)}
              options={toOpts(opcoes.centros)}
            />
            <FiltroSelect
              label="Natureza"
              value={filtroNatureza}
              onChange={comReset(setFiltroNatureza)}
              options={toOpts(opcoes.naturezas)}
            />
            {/* Limpar ocupa a 4ª coluna no xl, linha abaixo nos menores */}
            <div className="flex items-end">
              <BotaoLimparFiltros onClick={limparFiltros} />
            </div>
            <FiltroSelect
              label="Ano de Término"
              value={filtroAnoTermino}
              onChange={comReset(setFiltroAnoTermino)}
              options={toOpts(opcoes.anos_termino)}
            />
            <FiltroSelect
              label="Área do Conhecimento"
              value={filtroArea}
              onChange={comReset(setFiltroArea)}
              options={toOpts(opcoes.areas)}
            />
            <FiltroSelect
              label="Situação"
              value={filtroSituacao}
              onChange={comReset(setFiltroSituacao)}
              options={toOpts(opcoes.situacoes)}
            />
          </div>
        </div>
      </div>

      {/* ── Linha 2: Gráficos (esq) + Tabela (dir) ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Coluna de gráficos */}
        <div className="space-y-6">

          {/* Gráfico: Área do Conhecimento */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div ref={refGraficoArea}>
              <h3 className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 mb-3">
                Nº de Projetos x Área do Conhecimento
              </h3>
              {loadingGraficos ? (
                <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
                  Carregando…
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={dadosPorArea}
                    margin={{ top: 16, right: 8, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="area"
                      tick={<TickRotacionado />}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<TooltipGrafico />} />
                    <Bar dataKey="total" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <BotaoExportarPNG refGrafico={refGraficoArea} nomeArquivo="projetos_por_area" />
            </div>
          </div>

          {/* Gráfico: Centros/Campus */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div ref={refGraficoCentro}>
              <h3 className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 mb-3">
                Nº de Projetos x Centros/Campus
              </h3>
              {loadingGraficos ? (
                <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
                  Carregando…
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={dadosPorCentro}
                    margin={{ top: 16, right: 8, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="centro"
                      tick={<TickRotacionado />}
                      interval={0}
                    />
                    <YAxis tickFormatter={formatarEixoY} tick={{ fontSize: 11 }} />
                    <Tooltip content={<TooltipGrafico />} />
                    <Bar dataKey="total" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <BotaoExportarPNG refGrafico={refGraficoCentro} nomeArquivo="projetos_por_centro" />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Informações dos Projetos de Pesquisas
            </h3>
            <BotaoExportarCSV
              dados={projetos}
              nomeArquivo="projetos_pdi"
              colunas={COLUNAS}
            />
          </div>
          <TabelaPaginada
            colunas={COLUNAS}
            dados={projetos}
            pagina={pagina}
            totalPaginas={totalPaginas}
            onAnterior={() => setPagina((p) => p - 1)}
            onProxima={() => setPagina((p) => p + 1)}
            loading={loadingTabela}
          />
        </div>
      </div>
    </div>
  )
}
