import { useState, useEffect, useRef } from 'react'
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsIncubadas, getFiltrosIncubadas,
  getIncubadasPorIncubadora, getIncubadas,
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
  { key: 'nome_projeto',   label: 'Nome dos projetos incubados' },
  { key: 'objetivo',       label: 'Objetivo' },
  { key: 'equipe_projeto', label: 'Equipe do Projeto' },
]

const CORES_DONUT = [
  '#1E3A5F', '#4A90D9', '#2E5F8A', '#7AB3E0', '#A8D1F0',
]

function toOpts(arr = []) {
  return arr.map((v) => ({ value: String(v), label: String(v) }))
}

export default function EmpresasIncubadas() {
  const [kpis,                setKpis]                = useState({})
  const [opcoes,              setOpcoes]              = useState({})
  const [dadosPorIncubadora,  setDadosPorIncubadora]  = useState([])
  const [incubadas,           setIncubadas]           = useState([])
  const [pagina,              setPagina]              = useState(1)
  const [totalPaginas,        setTotalPaginas]        = useState(1)

  const [filtroIncubadora, setFiltroIncubadora] = useState('')
  const [filtroSituacao,   setFiltroSituacao]   = useState('')

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)
  const [loadingTabela,  setLoadingTabela]  = useState(true)

  const refGrafico = useRef(null)

  const filtrosAtivos = {
    incubadora: filtroIncubadora || undefined,
    situacao:   filtroSituacao   || undefined,
  }

  // Dados estáticos — mount apenas
  useEffect(() => {
    getKPIsIncubadas()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setLoadingKpis(false))

    getFiltrosIncubadas()
      .then(setOpcoes)
      .catch(() => {})
  }, [])

  // Gráfico donut — recarrega quando filtros mudam
  useEffect(() => {
    setLoadingGrafico(true)
    getIncubadasPorIncubadora(filtrosAtivos)
      .then(setDadosPorIncubadora)
      .catch(() => {})
      .finally(() => setLoadingGrafico(false))
  }, [filtroIncubadora, filtroSituacao]) // eslint-disable-line

  // Tabela — recarrega quando filtros ou página mudam
  useEffect(() => {
    setLoadingTabela(true)
    getIncubadas({ ...filtrosAtivos, skip: (pagina - 1) * LIMITE, limit: LIMITE })
      .then((data) => {
        if (Array.isArray(data)) {
          setIncubadas(data)
          setTotalPaginas(1)
        } else {
          setIncubadas(data.items ?? [])
          setTotalPaginas(Math.max(1, Math.ceil((data.total ?? 0) / LIMITE)))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroIncubadora, filtroSituacao, pagina]) // eslint-disable-line

  function comReset(setter) {
    return (val) => { setter(val); setPagina(1) }
  }

  function limparFiltros() {
    setFiltroIncubadora('')
    setFiltroSituacao('')
    setPagina(1)
  }

  const totalDonut = dadosPorIncubadora.reduce((s, d) => s + (d.total ?? 0), 0)

  return (
    <div className="space-y-6">

      {/* ── Linha 1: Cards + Filtros ──────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* 3 cards */}
        <div className="grid grid-cols-3 gap-4 flex-1">
          {loadingKpis ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <CardMetrica
                titulo="Empresas Incubadas"
                valor={kpis.total_incubadas}
                icone="🚀"
              />
              <CardMetrica
                titulo="Empresas Graduadas"
                valor={kpis.total_graduadas}
                icone="🎓"
              />
              <CardMetrica
                titulo="Incubadoras"
                valor={kpis.total_incubadoras}
                icone="🏛️"
              />
            </>
          )}
        </div>

        {/* Filtros */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex gap-2 items-end">
              <FiltroSelect
                label="Incubadora"
                value={filtroIncubadora}
                onChange={comReset(setFiltroIncubadora)}
                options={toOpts(opcoes.incubadoras)}
                className="flex-1"
              />
              <BotaoLimparFiltros onClick={limparFiltros} />
            </div>
            <FiltroSelect
              label="Situação"
              value={filtroSituacao}
              onChange={comReset(setFiltroSituacao)}
              options={toOpts(opcoes.situacoes)}
            />
          </div>
        </div>
      </div>

      {/* ── Linha 2: Donut (esq) + Tabela (dir) ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Donut — por Incubadora */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div ref={refGrafico}>
            <h3 className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 mb-3">
              Número de Empresas Incubadas por Incubadora
            </h3>
            {loadingGrafico ? (
              <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
                Carregando…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={dadosPorIncubadora}
                    dataKey="total"
                    nameKey="incubadora"
                    cx="42%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    label={({ value, percent }) =>
                      `${value} (${(percent * 100).toFixed(2).replace('.', ',')}%)`
                    }
                    labelLine
                  >
                    {dadosPorIncubadora.map((_, i) => (
                      <Cell key={i} fill={CORES_DONUT[i % CORES_DONUT.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipGrafico total={totalDonut} />} />
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
          <div className="flex justify-end mt-2">
            <BotaoExportarPNG
              refGrafico={refGrafico}
              nomeArquivo="incubadas_por_incubadora"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Informações das Empresas
            </h3>
            <BotaoExportarCSV
              dados={incubadas}
              nomeArquivo="incubadas"
              colunas={COLUNAS}
            />
          </div>
          <TabelaPaginada
            colunas={COLUNAS}
            dados={incubadas}
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
