import { useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const titulos = {
  '/':                     'Geral',
  '/projetos-pdi':         'Projetos PD&I',
  '/projetos-finep':       'Projetos FINEP',
  '/producao-intelectual': 'Produção Intelectual',
  '/bolsistas':            'Bolsistas',
  '/nucleos':              'Núcleos de Pesquisa',
  '/grupos':               'Grupos de Pesquisa',
  '/incubadas':            'Empresas Incubadas',
  '/pos-graduacao':        'Pós-Graduação',
  '/laboratorios':         'Laboratórios',
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const { dark, toggleTheme } = useTheme()
  const titulo = titulos[pathname] ?? ''

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center gap-4">
      {/* Hamburguer — só mobile */}
      <button
        onClick={onMenuClick}
        className="md:hidden text-gray-600 dark:text-gray-300 text-xl leading-none"
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {/* Título da página */}
      <h1 className="flex-1 text-base font-semibold text-gray-800 dark:text-white">
        {titulo}
      </h1>

      {/* Toggle dark mode — só desktop */}
      <button
        onClick={toggleTheme}
        className="hidden md:block text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors text-xl"
        aria-label="Alternar tema"
      >
        {dark ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
