import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  getKPIsProducao, getTiposProducao, getAnosProducao,
  getProducaoAnual, getVitrine,
} from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import FiltroTexto from '../components/FiltroTexto'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'

const CORES = [
  '#1E3A5F', '#2E5F8A', '#4A90D9', '#7AB3E0', '#A8D1F0',
  '#0D2B4A', '#1A4F7A', '#3D7DB5', '#6BA3CE', '#9BC4E3',
]

const COLUNAS_VITRINE = [
  { key: 'pedido',     label: 'PEDIDO' },
  { key: 'titulo',     label: 'TÍTULO' },
  { key: 'inventores', label: 'INVENTORES' },
  { key: 'descricao',  label: 'DESCRIÇÃO' },
]

const LIMITE = 10

export default function ProducaoIntelectual() {
  const [kpis, setKpis] = useState({})
  const [tiposDisponiveis, setTiposDisponiveis] = useState([])
  const [anosDisponiveis, setAnosDisponiveis]   = useState([])

  const [filtroInventor, setFiltroInventor] = useState('')
  const [filtroAno,      setFiltroAno]      = useState('')
  const [filtroTipo,     setFiltroTipo]     = useState('')

  const [dadosPatentes,  setDadosPatentes]  = useState([])
  const [dadosSoftwares, setDadosSoftwares] = useState([])

  const [vitrine,            setVitrine]            = useState([])
  const [paginaVitrine,      setPaginaVitrine]      = useState(1)
  const [totalPaginasVitrine, setTotalPaginasVitrine] = useState(1)

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGraficos, setLoadingGraficos] = useState(true)
  const [loadingVitrine, setLoadingVitrine] = useState(true)

  const refGraficoPatentes  = useRef(null)
  const refGraficoSoftwares = useRef(null)

  // Dados estáticos — apenas no mount
  useEffect(() => {
    getKPIsProducao()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setLoadingKpis(false))

    getTiposProducao()
      .then((data) => setTiposDisponiveis(data.map((t) => ({ value: t, label: t }))))
      .catch(() => {})

    getAnosProducao()
      .then((data) =>
        setAnosDisponiveis(data.map((a) => ({ value: String(a), label: String(a) })))
      )
      .catch(() => {})
  }, [])

  // Gráficos — recarrega quando filtroAno muda
  useEffect(() => {
    setLoadingGraficos(true)
    const params = filtroAno ? { ano: filtroAno } : {}
    Promise.all([
      getProducaoAnual({ tipo: 'PATENTE', ...params }),
      getProducaoAnual({ tipo: 'SOFTWARE', ...params }),
    ])
      .then(([patentes, softwares]) => {
        setDadosPatentes(patentes)
        setDadosSoftwares(softwares)
      })
      .catch(() => {})
      .finally(() => setLoadingGraficos(false))
  }, [filtroAno])

  // Vitrine — recarrega quando qualquer filtro ou página muda
  useEffect(() => {
    setLoadingVitrine(true)
    getVitrine({
      tipo:      filtroTipo      || undefined,
      ano:       filtroAno       || undefined,
      inventor:  filtroInventor  || undefined,
      skip:      (paginaVitrine - 1) * LIMITE,
      limit:     LIMITE,
    })
      .then((data) => {
        if (Array.isArray(data)) {
          setVitrine(data)
          setTotalPaginasVitrine(1)
        } else {
          setVitrine(data.items ?? [])
          setTotalPaginasVitrine(Math.max(1, Math.ceil((data.total ?? 0) / LIMITE)))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingVitrine(false))
  }, [filtroTipo, filtroAno, filtroInventor, paginaVitrine])

  // Reseta a página ao trocar filtros
  function comReset(setter) {
    return (val) => {
      setter(val)
      setPaginaVitrine(1)
    }
  }

  function limparFiltros() {
    setFiltroInventor('')
    setFiltroAno('')
    setFiltroTipo('')
    setPaginaVitrine(1)
  }

  const totalSoftwares = dadosSoftwares.reduce((s, d) => s + (d.depositadas ?? 0), 0)

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* ── Painel de filtros ─────────────────────────────────────────
          order-first em mobile (aparece acima dos gráficos)
          order-last em desktop (coluna direita)                       */}
      <div className="order-first lg:order-last lg:w-52 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-4 lg:sticky lg:top-4">
          <FiltroTexto
            label="Inventores"
            value={filtroInventor}
            onChange={comReset(setFiltroInventor)}
            placeholder="Buscar inventor…"
          />
          <FiltroSelect
            label="Ano"
            value={filtroAno}
            onChange={comReset(setFiltroAno)}
            options={anosDisponiveis}
          />
          <FiltroSelect
            label="Tipo"
            value={filtroTipo}
            onChange={comReset(setFiltroTipo)}
            options={tiposDisponiveis}
          />
          <BotaoLimparFiltros onClick={limparFiltros} />
        </div>
      </div>

      {/* ── Conteúdo principal ───────────────────────────────────────── */}
      <div className="order-last lg:order-first flex-1 min-w-0 space-y-6">

        {/* Cards KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loadingKpis ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <CardMetrica titulo="Patentes"           valor={kpis['PATENTE']}            icone="💡" />
              <CardMetrica titulo="Softwares"          valor={kpis['SOFTWARE']}            icone="💻" />
              <CardMetrica titulo="Marcas"             valor={kpis['MARCA']}               icone="®️" />
              <CardMetrica titulo="Desenho Industrial" valor={kpis['DESENHO INDUSTRIAL']}  icone="🎨" />
            </>
          )}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Bar Chart — Patentes depositadas x Ano */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div ref={refGraficoPatentes}>
              <h3 className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 mb-3">
                Patentes depositadas x Ano
              </h3>
              {loadingGraficos ? (
                <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
                  Carregando…
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={dadosPatentes}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="ano" width={50} tick={{ fontSize: 11 }} />
                    <Tooltip content={<TooltipGrafico />} />
                    <Bar dataKey="depositadas" fill="#1E3A5F" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <BotaoExportarPNG refGrafico={refGraficoPatentes} nomeArquivo="patentes_por_ano" />
            </div>
          </div>

          {/* Pie Chart — Softwares Registrados x Ano */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div ref={refGraficoSoftwares}>
              <h3 className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 mb-3">
                Softwares Registrados x Ano
              </h3>
              {loadingGraficos ? (
                <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
                  Carregando…
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={dadosSoftwares}
                      dataKey="depositadas"
                      nameKey="ano"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                    >
                      {dadosSoftwares.map((_, i) => (
                        <Cell key={i} fill={CORES[i % CORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<TooltipGrafico total={totalSoftwares} />} />
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
              <BotaoExportarPNG refGrafico={refGraficoSoftwares} nomeArquivo="softwares_por_ano" />
            </div>
          </div>
        </div>

        {/* Tabela Vitrine */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Informações das Produções Intelectuais
            </h3>
            <BotaoExportarCSV
              dados={vitrine}
              nomeArquivo="producao_intelectual"
              colunas={COLUNAS_VITRINE}
            />
          </div>
          <TabelaPaginada
            colunas={COLUNAS_VITRINE}
            dados={vitrine}
            pagina={paginaVitrine}
            totalPaginas={totalPaginasVitrine}
            onAnterior={() => setPaginaVitrine((p) => p - 1)}
            onProxima={() => setPaginaVitrine((p) => p + 1)}
            loading={loadingVitrine}
          />
        </div>
      </div>
    </div>
  )
}
