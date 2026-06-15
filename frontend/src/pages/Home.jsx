import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getKPIs } from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'

export default function Home() {
  const [kpis, setKpis] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getKPIs()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    {
      titulo: 'Projetos PD&I Cadastrados',
      valor: kpis.total_projetos_pdi,
      icone: '📋',
      onClick: () => navigate('/projetos-pdi'),
    },
    {
      titulo: 'Projetos FINEP',
      valor: kpis.total_projetos_finep != null
        ? `${kpis.total_projetos_finep} Mi`
        : undefined,
      icone: '💰',
      onClick: () => navigate('/projetos-finep'),
    },
    {
      titulo: 'Produção Intelectual',
      valor: kpis.total_producao_intelectual,
      icone: '💡',
      onClick: () => navigate('/producao-intelectual'),
    },
    {
      titulo: 'Bolsistas de Produtividade',
      valor: kpis.total_bolsistas,
      icone: '🎓',
      onClick: () => navigate('/bolsistas'),
    },
    {
      titulo: 'Núcleos de Pesquisa',
      valor: kpis.total_nucleos,
      icone: '⚛️',
      onClick: () => navigate('/nucleos'),
    },
    {
      titulo: 'Grupos de Pesquisa (DGP/CNPq)',
      valor: kpis.total_grupos,
      icone: '👥',
      onClick: () => navigate('/grupos'),
    },
    {
      titulo: 'Empresas Incubadas',
      valor: kpis.total_incubadas,
      icone: '🚀',
      onClick: () => navigate('/incubadas'),
    },
    {
      titulo: 'Pós-Graduação',
      valor: kpis.total_pos_graduacao,
      icone: '🎓',
      onClick: () => navigate('/pos-graduacao'),
    },
    {
      titulo: 'Laboratórios (PNIPE/MCTI)',
      valor: kpis.total_laboratorios,
      icone: '🔬',
      onClick: () => navigate('/laboratorios'),
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-center font-bold text-azul-escuro text-lg uppercase tracking-wide mb-8">
        Painel de Pesquisa, Desenvolvimento e Inovação — UFPI
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <CardMetrica key={card.titulo} {...card} />
        ))}
      </div>

      {kpis.ultima_atualizacao && (
        <p className="text-center text-sm text-gray-500 mt-8">
          Última atualização: {kpis.ultima_atualizacao}
        </p>
      )}
    </div>
  )
}
