import { useState, useEffect, useRef } from 'react'
import {
  PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
  ResponsiveContainer,
} from 'recharts'
import {
  getKPIsFinep, getFiltrosFinep,
  getRelacaoTipoFinep, getPorCentroFinep,
} from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarPNG from '../components/BotaoExportarPNG'

const CORES_DONUT = ['#1E3A5F', '#4A90D9']

function toOpts(arr = []) {
  return arr.map((v) => ({ value: String(v), label: String(v) }))
}

function formatarMi(v) {
  if (v == null) return '-'
  return v.toFixed(2).replace('.', ',') + ' Mi'
}

function formatarEixoMi(v) {
  return `R$ ${Number(v).toFixed(1).replace('.', ',')} Mi`
}

// Rótulo no topo de cada barra
function BarLabelMi({ x, y, width, value }) {
  return (
    <text
      x={x + width / 2}
      y={y - 4}
      textAnchor="middle"
      fontSize={10}
      fill="#374151"
    >
      {`R$ ${Number(value).toFixed(1).replace('.', ',')} Mi`}
    </text>
  )
}

export default function ProjetosFinep() {
  const [kpis,          setKpis]          = useState({})
  const [opcoes,        setOpcoes]        = useState({})
  const [dadosRelacao,  setDadosRelacao]  = useState([])
  const [dadosPorCentro, setDadosPorCentro] = useState([])

  const [filtroAnoInicio,  setFiltroAnoInicio]  = useState('')
  const [filtroAnoTermino, setFiltroAnoTermino] = useState('')
  const [filtroCentro,     setFiltroCentro]     = useState('')
  const [filtroNatureza,   setFiltroNatureza]   = useState('')
  const [filtroSituacao,   setFiltroSituacao]   = useState('')

  const [loadingKpis,     setLoadingKpis]     = useState(true)
  const [loadingGraficos, setLoadingGraficos] = useState(true)

  const refGraficoDonut  = useRef(null)
  const refGraficoCentro = useRef(null)

  const filtrosAtivos = {
    ano_inicio:  filtroAnoInicio  || undefined,
    ano_termino: filtroAnoTermino || undefined,
    centro:      filtroCentro     || undefined,
    natureza:    filtroNatureza   || undefined,
    situacao:    filtroSituacao   || undefined,
  }

  // Dados estáticos — mount apenas
  useEffect(() => {
    getKPIsFinep()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setLoadingKpis(false))

    getFiltrosFinep()
      .then(setOpcoes)
      .catch(() => {})
  }, [])

  // Gráficos — recarrega quando filtros mudam
  useEffect(() => {
    setLoadingGraficos(true)
    Promise.all([
      getRelacaoTipoFinep(filtrosAtivos),
      getPorCentroFinep(filtrosAtivos),
    ])
      .then(([relacao, centro]) => {
        setDadosRelacao(relacao)
        setDadosPorCentro(centro)
      })
      .catch(() => {})
      .finally(() => setLoadingGraficos(false))
  }, [filtroAnoInicio, filtroAnoTermino, filtroCentro, filtroNatureza, filtroSituacao]) // eslint-disable-line

  function limparFiltros() {
    setFiltroAnoInicio('')
    setFiltroAnoTermino('')
    setFiltroCentro('')
    setFiltroNatureza('')
    setFiltroSituacao('')
  }

  const totalRelacao = dadosRelacao.reduce((s, d) => s + (d.total ?? 0), 0)

  return (
    <div className="space-y-6">

      {/* ── Linha 1: Cards + Filtros ────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Cards KPI */}
        <div className="grid grid-cols-2 gap-4 lg:w-72 flex-shrink-0">
          {loadingKpis ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <CardMetrica
                titulo="Valor Total"
                valor={formatarMi(kpis.valor_total_mi)}
                icone="💰"
              />
              <CardMetrica
                titulo="Projetos Financiados"
                valor={kpis.total_projetos}
                icone="📊"
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
              onChange={setFiltroAnoInicio}
              options={toOpts(opcoes.anos_inicio)}
            />
            <FiltroSelect
              label="Ano de Término"
              value={filtroAnoTermino}
              onChange={setFiltroAnoTermino}
              options={toOpts(opcoes.anos_termino)}
            />
            <FiltroSelect
              label="Centro/Campi"
              value={filtroCentro}
              onChange={setFiltroCentro}
              options={toOpts(opcoes.centros)}
            />
            <div className="flex items-end">
              <BotaoLimparFiltros onClick={limparFiltros} />
            </div>
            <FiltroSelect
              label="Natureza"
              value={filtroNatureza}
              onChange={setFiltroNatureza}
              options={toOpts(opcoes.naturezas)}
            />
            <FiltroSelect
              label="Situação"
              value={filtroSituacao}
              onChange={setFiltroSituacao}
              options={toOpts(opcoes.situacoes)}
            />
          </div>
        </div>
      </div>

      {/* ── Linha 2: Donut + Barras ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Donut — Relação Internos x Externos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div ref={refGraficoDonut}>
            <h3 className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 mb-3">
              Relação: Internos x Externos
            </h3>
            {loadingGraficos ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                Carregando…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosRelacao}
                    dataKey="total"
                    nameKey="tipo"
                    cx="42%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={105}
                    label={({ value, percent }) =>
                      `${value} (${(percent * 100).toFixed(1)}%)`
                    }
                    labelLine
                  >
                    {dadosRelacao.map((_, i) => (
                      <Cell key={i} fill={CORES_DONUT[i % CORES_DONUT.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipGrafico total={totalRelacao} />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ fontSize: 11 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-2">
            <BotaoExportarPNG
              refGrafico={refGraficoDonut}
              nomeArquivo="finep_relacao_tipo"
            />
          </div>
        </div>

        {/* Barras — Valor por Centro/Campi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div ref={refGraficoCentro}>
            <h3 className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 mb-3">
              Valor Total de Fomento por Centro/Campi
            </h3>
            {loadingGraficos ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                Carregando…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dadosPorCentro}
                  margin={{ top: 28, right: 8, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="centro" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={formatarEixoMi}
                    tick={{ fontSize: 10 }}
                    width={68}
                  />
                  <Tooltip
                    content={
                      <TooltipGrafico
                        formatarValor={(v) => `R$ ${formatarMi(v)}`}
                      />
                    }
                  />
                  <Bar dataKey="valor_mi" fill="#2E5F8A" radius={[4, 4, 0, 0]}>
                    <LabelList content={<BarLabelMi />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-2">
            <BotaoExportarPNG
              refGrafico={refGraficoCentro}
              nomeArquivo="finep_por_centro"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
