import { useState, useEffect, useRef } from 'react'
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsLaboratorios, getFiltrosLaboratorios,
  getLaboratoriosPorCentro, getLaboratorios,
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
  { key: 'nome',       label: 'NOME' },
  { key: 'sigla',      label: 'SIGLA' },
  { key: 'centro_campi', label: 'CENTRO/CAMPI' },
  { key: 'responsavel', label: 'RESPONSÁVEL' },
  { key: 'email',      label: 'EMAIL' },
]

const CORES_PIE = [
  '#7AB3E0', '#1E3A5F', '#4A90D9', '#2E5F8A', '#0D2B4A',
  '#A8D1F0', '#3D7DB5', '#6BA3CE', '#9BC4E3', '#1A4F7A',
]

function toOpts(arr = []) {
  return arr.map((v) => ({ value: String(v), label: String(v) }))
}

function CardLabs({ valor, loading }) {
  if (loading) return <SkeletonCard />
  return (
    <div className="h-full bg-azul-escuro text-white rounded-xl px-6 py-10 flex flex-col items-center justify-center text-center">
      <p className="text-lg font-bold uppercase tracking-wide opacity-80 leading-tight">
        Laboratórios
      </p>
      <span className="text-4xl mt-3">🔬</span>
      <p className="text-6xl font-bold mt-3">{valor ?? '—'}</p>
    </div>
  )
}

export default function Laboratorios() {
  const [kpis,          setKpis]          = useState({})
  const [opcoes,        setOpcoes]        = useState({})
  const [dadosPorCentro, setDadosPorCentro] = useState([])
  const [labs,          setLabs]          = useState([])
  const [pagina,        setPagina]        = useState(1)
  const [totalPaginas,  setTotalPaginas]  = useState(1)

  const [filtroNome,   setFiltroNome]   = useState('')
  const [filtroCentro, setFiltroCentro] = useState('')

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)
  const [loadingTabela,  setLoadingTabela]  = useState(true)

  const refGrafico = useRef(null)

  const filtrosAtivos = {
    nome:        filtroNome   || undefined,
    centro_campi: filtroCentro || undefined,
  }

  // Dados estáticos — mount apenas
  useEffect(() => {
    getKPIsLaboratorios()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setLoadingKpis(false))

    getFiltrosLaboratorios()
      .then(setOpcoes)
      .catch(() => {})
  }, [])

  // Gráfico — recarrega quando filtros mudam
  useEffect(() => {
    setLoadingGrafico(true)
    getLaboratoriosPorCentro(filtrosAtivos)
      .then(setDadosPorCentro)
      .catch(() => {})
      .finally(() => setLoadingGrafico(false))
  }, [filtroNome, filtroCentro]) // eslint-disable-line

  // Tabela — recarrega quando filtros ou página mudam
  useEffect(() => {
    setLoadingTabela(true)
    getLaboratorios({ ...filtrosAtivos, skip: (pagina - 1) * LIMITE, limit: LIMITE })
      .then((data) => {
        if (Array.isArray(data)) {
          setLabs(data)
          setTotalPaginas(1)
        } else {
          setLabs(data.items ?? [])
          setTotalPaginas(Math.max(1, Math.ceil((data.total ?? 0) / LIMITE)))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroNome, filtroCentro, pagina]) // eslint-disable-line

  function comReset(setter) {
    return (val) => { setter(val); setPagina(1) }
  }

  function limparFiltros() {
    setFiltroNome('')
    setFiltroCentro('')
    setPagina(1)
  }

  const totalPie = dadosPorCentro.reduce((s, d) => s + (d.total ?? 0), 0)

  return (
    <div className="space-y-6">

      {/* ── Top: Card + Gráfico + Filtros ──────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">

        {/* Card único */}
        <div className="lg:w-52 flex-shrink-0">
          <CardLabs valor={kpis.total_laboratorios} loading={loadingKpis} />
        </div>

        {/* Gráfico pizza */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div ref={refGrafico}>
            <h3 className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 mb-2">
              Nº de Laboratório x Centro/Campi
            </h3>
            {loadingGrafico ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                Carregando…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={290}>
                <PieChart>
                  <Pie
                    data={dadosPorCentro}
                    dataKey="total"
                    nameKey="centro"
                    cx="40%"
                    cy="50%"
                    outerRadius={110}
                    label={({ value, percent }) =>
                      `${value} (${(percent * 100).toFixed(2).replace('.', ',')}%)`
                    }
                    labelLine
                  >
                    {dadosPorCentro.map((_, i) => (
                      <Cell key={i} fill={CORES_PIE[i % CORES_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipGrafico total={totalPie} />} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: 11 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="laboratorios_por_centro" />
          </div>
        </div>

        {/* Filtros — coluna direita */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3 lg:sticky lg:top-4">
            <div className="flex gap-2 items-end">
              <FiltroSelect
                label="Nome do laboratório"
                value={filtroNome}
                onChange={comReset(setFiltroNome)}
                options={toOpts(opcoes.nomes)}
                className="flex-1"
              />
              <BotaoLimparFiltros onClick={limparFiltros} />
            </div>
            <FiltroSelect
              label="Centro/Campi"
              value={filtroCentro}
              onChange={comReset(setFiltroCentro)}
              options={toOpts(opcoes.centros)}
            />
          </div>
        </div>
      </div>

      {/* ── Tabela full-width ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Informações dos Laboratórios
          </h3>
          <BotaoExportarCSV
            dados={labs}
            nomeArquivo="laboratorios"
            colunas={COLUNAS}
          />
        </div>
        <TabelaPaginada
          colunas={COLUNAS}
          dados={labs}
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
