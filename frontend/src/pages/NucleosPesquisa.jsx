import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsNucleos, getFiltrosNucleos,
  getNucleosPorCentro, getNucleos,
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
  { key: 'denominacao',   label: 'DENOMINAÇÃO' },
  { key: 'centro_campus', label: 'CENTRO/CAMPUS' },
  { key: 'coordenador',   label: 'COORDENADOR' },
  { key: 'ano_resolucao', label: 'Ano da Resolução' },
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

export default function NucleosPesquisa() {
  const [kpis,          setKpis]          = useState({})
  const [opcoes,        setOpcoes]        = useState({})
  const [dadosPorCentro, setDadosPorCentro] = useState([])
  const [nucleos,       setNucleos]       = useState([])
  const [pagina,        setPagina]        = useState(1)
  const [totalPaginas,  setTotalPaginas]  = useState(1)

  const [filtroCentro,      setFiltroCentro]      = useState('')
  const [filtroVinculacao,  setFiltroVinculacao]  = useState('')
  const [filtroAno,         setFiltroAno]         = useState('')
  const [filtroDenominacao, setFiltroDenominacao] = useState('')

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)
  const [loadingTabela,  setLoadingTabela]  = useState(true)

  const refGrafico = useRef(null)

  const filtrosAtivos = {
    centro_campus: filtroCentro      || undefined,
    vinculacao:    filtroVinculacao  || undefined,
    ano_resolucao: filtroAno         || undefined,
    denominacao:   filtroDenominacao || undefined,
  }

  // Dados estáticos — mount apenas
  useEffect(() => {
    getKPIsNucleos()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setLoadingKpis(false))

    getFiltrosNucleos()
      .then(setOpcoes)
      .catch(() => {})
  }, [])

  // Gráfico — recarrega quando filtros mudam
  useEffect(() => {
    setLoadingGrafico(true)
    getNucleosPorCentro(filtrosAtivos)
      .then(setDadosPorCentro)
      .catch(() => {})
      .finally(() => setLoadingGrafico(false))
  }, [filtroCentro, filtroVinculacao, filtroAno, filtroDenominacao]) // eslint-disable-line

  // Tabela — recarrega quando filtros ou página mudam
  useEffect(() => {
    setLoadingTabela(true)
    getNucleos({ ...filtrosAtivos, skip: (pagina - 1) * LIMITE, limit: LIMITE })
      .then((data) => {
        if (Array.isArray(data)) {
          setNucleos(data)
          setTotalPaginas(1)
        } else {
          setNucleos(data.items ?? [])
          setTotalPaginas(Math.max(1, Math.ceil((data.total ?? 0) / LIMITE)))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroCentro, filtroVinculacao, filtroAno, filtroDenominacao, pagina]) // eslint-disable-line

  function comReset(setter) {
    return (val) => { setter(val); setPagina(1) }
  }

  function limparFiltros() {
    setFiltroCentro('')
    setFiltroVinculacao('')
    setFiltroAno('')
    setFiltroDenominacao('')
    setPagina(1)
  }

  return (
    <div className="space-y-6">

      {/* ── Linha 1: Cards + Filtros ──────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* 3 cards */}
        <div className="grid grid-cols-3 gap-4 lg:w-96 flex-shrink-0">
          {loadingKpis ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <CardMetrica
                titulo="Total de Núcleos"
                valor={kpis.total_nucleos}
                icone="⚛️"
              />
              <CardMetrica
                titulo="Ativos"
                valor={kpis.total_ativos}
                icone="✅"
              />
              <CardMetrica
                titulo="Inativos"
                valor={kpis.total_inativos}
                icone="⏸️"
              />
            </>
          )}
        </div>

        {/* Filtros */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <FiltroSelect
              label="Centro/Campi"
              value={filtroCentro}
              onChange={comReset(setFiltroCentro)}
              options={toOpts(opcoes.centros)}
            />
            <FiltroSelect
              label="Vinculação"
              value={filtroVinculacao}
              onChange={comReset(setFiltroVinculacao)}
              options={toOpts(opcoes.vinculacoes)}
            />
            <div className="flex items-end">
              <BotaoLimparFiltros onClick={limparFiltros} />
            </div>
            <FiltroSelect
              label="Ano"
              value={filtroAno}
              onChange={comReset(setFiltroAno)}
              options={toOpts(opcoes.anos)}
            />
            <FiltroSelect
              label="Núcleos"
              value={filtroDenominacao}
              onChange={comReset(setFiltroDenominacao)}
              options={toOpts(opcoes.nucleos)}
            />
          </div>
        </div>
      </div>

      {/* ── Linha 2: Gráfico (esq) + Tabela (dir) ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico de barras */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div ref={refGrafico}>
            <h3 className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 mb-3">
              Nº de Núcleos x Centro/Campi
            </h3>
            {loadingGrafico ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                Carregando…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dadosPorCentro}
                  margin={{ top: 16, right: 8, left: 0, bottom: 56 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="centro"
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
            <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="nucleos_por_centro" />
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Informações dos Núcleos de Pesquisa
            </h3>
            <BotaoExportarCSV
              dados={nucleos}
              nomeArquivo="nucleos"
              colunas={COLUNAS}
            />
          </div>
          <TabelaPaginada
            colunas={COLUNAS}
            dados={nucleos}
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
