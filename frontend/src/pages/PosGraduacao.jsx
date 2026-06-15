import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsPosGraduacao, getFiltrosPosGraduacao,
  getPosGraduacaoPorCentro, getPosGraduacao,
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
  { key: 'programa', label: 'PROGRAMA' },
  { key: 'fone',     label: 'FONE' },
  { key: 'email',    label: 'EMAIL' },
  { key: 'centro',   label: 'CENTRO' },
  { key: 'nivel',    label: 'NÍVEL' },
]

function TickRotacionado({ x, y, payload }) {
  const texto =
    typeof payload.value === 'string' && payload.value.length > 10
      ? payload.value.slice(0, 10) + '…'
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

function toOpts(arr = []) {
  return arr.map((v) => ({ value: String(v), label: String(v) }))
}

function CardPosGrad({ valor, loading }) {
  if (loading) return <SkeletonCard />
  return (
    <div className="h-full bg-azul-escuro text-white rounded-xl px-6 py-10 flex flex-col items-center justify-center text-center">
      <p className="text-lg font-bold uppercase tracking-wide opacity-80 leading-tight">
        Pós-Graduação
      </p>
      <span className="text-4xl mt-3">🎓</span>
      <p className="text-6xl font-bold mt-3">{valor ?? '—'}</p>
    </div>
  )
}

export default function PosGraduacao() {
  const [kpis,          setKpis]          = useState({})
  const [opcoes,        setOpcoes]        = useState({})
  const [dadosPorCentro, setDadosPorCentro] = useState([])
  const [programas,     setProgramas]     = useState([])
  const [pagina,        setPagina]        = useState(1)
  const [totalPaginas,  setTotalPaginas]  = useState(1)

  const [filtroPrograma,      setFiltroPrograma]      = useState('')
  const [filtroConceito,      setFiltroConceito]      = useState('')
  const [filtroCentro,        setFiltroCentro]        = useState('')
  const [filtroNivel,         setFiltroNivel]         = useState('')
  const [filtroTipo,          setFiltroTipo]          = useState('')

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)
  const [loadingTabela,  setLoadingTabela]  = useState(true)

  const refGrafico = useRef(null)

  const filtrosAtivos = {
    programa:      filtroPrograma  || undefined,
    conceito_capes: filtroConceito || undefined,
    centro:        filtroCentro    || undefined,
    nivel:         filtroNivel     || undefined,
    tipo:          filtroTipo      || undefined,
  }

  // Dados estáticos — mount apenas
  useEffect(() => {
    getKPIsPosGraduacao()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setLoadingKpis(false))

    getFiltrosPosGraduacao()
      .then(setOpcoes)
      .catch(() => {})
  }, [])

  // Gráfico — recarrega quando filtros mudam
  useEffect(() => {
    setLoadingGrafico(true)
    getPosGraduacaoPorCentro(filtrosAtivos)
      .then(setDadosPorCentro)
      .catch(() => {})
      .finally(() => setLoadingGrafico(false))
  }, [filtroPrograma, filtroConceito, filtroCentro, filtroNivel, filtroTipo]) // eslint-disable-line

  // Tabela — recarrega quando filtros ou página mudam
  useEffect(() => {
    setLoadingTabela(true)
    getPosGraduacao({ ...filtrosAtivos, skip: (pagina - 1) * LIMITE, limit: LIMITE })
      .then((data) => {
        if (Array.isArray(data)) {
          setProgramas(data)
          setTotalPaginas(1)
        } else {
          setProgramas(data.items ?? [])
          setTotalPaginas(Math.max(1, Math.ceil((data.total ?? 0) / LIMITE)))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroPrograma, filtroConceito, filtroCentro, filtroNivel, filtroTipo, pagina]) // eslint-disable-line

  function comReset(setter) {
    return (val) => { setter(val); setPagina(1) }
  }

  function limparFiltros() {
    setFiltroPrograma('')
    setFiltroConceito('')
    setFiltroCentro('')
    setFiltroNivel('')
    setFiltroTipo('')
    setPagina(1)
  }

  return (
    <div className="space-y-6">

      {/* ── Top: Card + Gráfico + Filtros ──────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">

        {/* Card único */}
        <div className="lg:w-52 flex-shrink-0">
          <CardPosGrad valor={kpis.total_pos_graduacao} loading={loadingKpis} />
        </div>

        {/* Gráfico de barras */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div ref={refGrafico}>
            <h3 className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 mb-2">
              Nº de Pós-graduação x Centro
            </h3>
            {loadingGrafico ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                Carregando…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart
                  data={dadosPorCentro}
                  margin={{ top: 16, right: 8, left: 0, bottom: 52 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="centro"
                    tick={<TickRotacionado />}
                    interval={0}
                    label={{
                      value: 'CENTRO',
                      position: 'insideBottom',
                      offset: -40,
                      fontSize: 11,
                      fill: '#6B7280',
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    label={{
                      value: 'Contagem de Programas',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 12,
                      fontSize: 10,
                      fill: '#6B7280',
                    }}
                  />
                  <Tooltip content={<TooltipGrafico />} />
                  <Bar dataKey="total" fill="#2E5F8A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="pos_graduacao_por_centro" />
          </div>
        </div>

        {/* Filtros — coluna direita */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm lg:sticky lg:top-4">
            <div className="grid grid-cols-2 gap-3">
              <FiltroSelect
                label="Programa"
                value={filtroPrograma}
                onChange={comReset(setFiltroPrograma)}
                options={toOpts(opcoes.programas)}
              />
              <FiltroSelect
                label="Conceito CAPES"
                value={filtroConceito}
                onChange={comReset(setFiltroConceito)}
                options={toOpts(opcoes.conceitos_capes)}
              />
              <FiltroSelect
                label="Centro/Campi"
                value={filtroCentro}
                onChange={comReset(setFiltroCentro)}
                options={toOpts(opcoes.centros)}
              />
              <FiltroSelect
                label="Nível"
                value={filtroNivel}
                onChange={comReset(setFiltroNivel)}
                options={toOpts(opcoes.niveis)}
              />
              <FiltroSelect
                label="Tipo"
                value={filtroTipo}
                onChange={comReset(setFiltroTipo)}
                options={toOpts(opcoes.tipos)}
              />
              <div className="flex items-end">
                <BotaoLimparFiltros onClick={limparFiltros} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabela full-width ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Informações dos Programas de Pós-Graduação
          </h3>
          <BotaoExportarCSV
            dados={programas}
            nomeArquivo="pos_graduacao"
            colunas={COLUNAS}
          />
        </div>
        <TabelaPaginada
          colunas={COLUNAS}
          dados={programas}
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
