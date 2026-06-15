import { useState, useEffect, useRef } from 'react'
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsBolsistas, getFiltrosBolsistas, getBolsistasPorCampus,
} from '../api/index.js'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarPNG from '../components/BotaoExportarPNG'

const CORES_CAMPUS = [
  '#1E3A5F', '#2E5F8A', '#4A90D9', '#E74C3C', '#F39C12',
  '#2ECC71', '#9B59B6', '#1ABC9C', '#E67E22', '#3498DB',
  '#D35400', '#27AE60', '#8E44AD', '#16A085', '#C0392B',
]

function toOpts(arr = []) {
  return arr.map((v) => ({ value: String(v), label: String(v) }))
}

// Card maior — título centralizado, valor em destaque
function CardGrande({ titulo, valor, loading }) {
  if (loading) return <SkeletonCard />
  return (
    <div className="bg-azul-escuro text-white rounded-xl px-6 py-10 flex flex-col items-center justify-center text-center">
      <p className="text-xl font-bold uppercase tracking-widest opacity-80">
        {titulo}
      </p>
      <p className="text-6xl font-bold mt-4">{valor ?? '—'}</p>
    </div>
  )
}

export default function Bolsistas() {
  const [kpis,          setKpis]          = useState({})
  const [opcoes,        setOpcoes]        = useState({})
  const [dadosPorCampus, setDadosPorCampus] = useState([])

  const [filtroModalidade, setFiltroModalidade] = useState('')
  const [filtroOrgao,      setFiltroOrgao]      = useState('')
  const [filtroCentro,     setFiltroCentro]     = useState('')
  const [filtroNome,       setFiltroNome]       = useState('')

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)

  const refGrafico = useRef(null)

  // Dados estáticos — mount apenas
  useEffect(() => {
    getKPIsBolsistas()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setLoadingKpis(false))

    getFiltrosBolsistas()
      .then(setOpcoes)
      .catch(() => {})
  }, [])

  // Gráfico — recarrega quando filtros mudam
  useEffect(() => {
    setLoadingGrafico(true)
    getBolsistasPorCampus({
      modalidade: filtroModalidade || undefined,
      orgao:      filtroOrgao      || undefined,
      centro:     filtroCentro     || undefined,
      nome:       filtroNome       || undefined,
    })
      .then(setDadosPorCampus)
      .catch(() => {})
      .finally(() => setLoadingGrafico(false))
  }, [filtroModalidade, filtroOrgao, filtroCentro, filtroNome])

  function limparFiltros() {
    setFiltroModalidade('')
    setFiltroOrgao('')
    setFiltroCentro('')
    setFiltroNome('')
  }

  const totalCampus = dadosPorCampus.reduce((s, d) => s + (d.total ?? 0), 0)

  return (
    <div className="space-y-6">

      {/* ── Linha 1: Cards + Filtros ───────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Cards grandes */}
        <div className="grid grid-cols-2 gap-4 lg:w-80 flex-shrink-0">
          <CardGrande titulo="CNPq" valor={kpis.total_cnpq} loading={loadingKpis} />
          <CardGrande titulo="UFPI" valor={kpis.total_ufpi} loading={loadingKpis} />
        </div>

        {/* Filtros */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <FiltroSelect
              label="Modalidade"
              value={filtroModalidade}
              onChange={setFiltroModalidade}
              options={toOpts(opcoes.modalidades)}
            />
            <FiltroSelect
              label="Órgão"
              value={filtroOrgao}
              onChange={setFiltroOrgao}
              options={toOpts(opcoes.orgaos)}
            />
            <div className="flex items-end">
              <BotaoLimparFiltros onClick={limparFiltros} />
            </div>
            <FiltroSelect
              label="Centro/Campus"
              value={filtroCentro}
              onChange={setFiltroCentro}
              options={toOpts(opcoes.campi)}
            />
            <FiltroSelect
              label="Nome"
              value={filtroNome}
              onChange={setFiltroNome}
              options={toOpts(opcoes.nomes)}
            />
          </div>
        </div>
      </div>

      {/* ── Linha 2: Pizza por Campus/Centro ────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div ref={refGrafico}>
          <h3 className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 mb-3">
            Bolsistas por Campus/Centro
          </h3>
          {loadingGrafico ? (
            <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
              Carregando…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={dadosPorCampus}
                  dataKey="total"
                  nameKey="campus"
                  cx="40%"
                  cy="50%"
                  outerRadius={145}
                  label={({ value, percent }) =>
                    `${value} (${(percent * 100).toFixed(2).replace('.', ',')}%)`
                  }
                  labelLine
                >
                  {dadosPorCampus.map((_, i) => (
                    <Cell key={i} fill={CORES_CAMPUS[i % CORES_CAMPUS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipGrafico total={totalCampus} />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex justify-end mt-2">
          <BotaoExportarPNG
            refGrafico={refGrafico}
            nomeArquivo="bolsistas_por_campus"
          />
        </div>
      </div>
    </div>
  )
}
