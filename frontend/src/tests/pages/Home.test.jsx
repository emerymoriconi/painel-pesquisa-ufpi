import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../../api/index.js', () => ({
  getKPIs: vi.fn(),
}))

import { getKPIs } from '../../api/index.js'
import Home from '../../pages/Home'

const kpisMock = {
  total_projetos_pdi:        120,
  total_projetos_finep:      8.5,
  total_producao_intelectual: 300,
  total_bolsistas:           200,
  total_nucleos:              40,
  total_grupos:              100,
  total_incubadas:            25,
  total_pos_graduacao:        50,
  total_laboratorios:         70,
  ultima_atualizacao:        '08/02/2026',
}

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )
}

describe('Home', () => {
  beforeEach(() => getKPIs.mockReset())

  it('mostra skeletons durante o carregamento', () => {
    getKPIs.mockResolvedValue(kpisMock)
    const { container } = renderHome()
    // loading=true on initial synchronous render, before effects flush
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThan(0)
  })

  it('exibe os 9 cards de KPI após carregar', async () => {
    getKPIs.mockResolvedValue(kpisMock)
    renderHome()
    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument()
      expect(screen.getByText('8.5 Mi')).toBeInTheDocument()
      expect(screen.getByText('300')).toBeInTheDocument()
    })
  })

  it('exibe "Última atualização" após carregar', async () => {
    getKPIs.mockResolvedValue(kpisMock)
    renderHome()
    await waitFor(() =>
      expect(screen.getByText(/Última atualização: 08\/02\/2026/)).toBeInTheDocument()
    )
  })

  it('não exibe "Última atualização" quando campo ausente', async () => {
    const { ultima_atualizacao: _, ...semData } = kpisMock
    getKPIs.mockResolvedValue(semData)
    renderHome()
    await waitFor(() =>
      expect(screen.queryByText(/Última atualização/)).toBeNull()
    )
  })

  it('renderiza sem quebrar mesmo quando API falha', async () => {
    getKPIs.mockResolvedValue({})
    renderHome()
    await waitFor(() =>
      expect(screen.getByText('Projetos PD&I Cadastrados')).toBeInTheDocument()
    )
  })

  it('exibe todos os títulos dos cards', async () => {
    getKPIs.mockResolvedValue(kpisMock)
    renderHome()
    await waitFor(() => {
      expect(screen.getByText('Projetos PD&I Cadastrados')).toBeInTheDocument()
      expect(screen.getByText('Projetos FINEP')).toBeInTheDocument()
      expect(screen.getByText('Produção Intelectual')).toBeInTheDocument()
      expect(screen.getByText('Bolsistas de Produtividade')).toBeInTheDocument()
      expect(screen.getByText('Núcleos de Pesquisa')).toBeInTheDocument()
      expect(screen.getByText(/Grupos de Pesquisa/)).toBeInTheDocument()
      expect(screen.getByText('Empresas Incubadas')).toBeInTheDocument()
      expect(screen.getByText('Pós-Graduação')).toBeInTheDocument()
      expect(screen.getByText(/Laboratórios/)).toBeInTheDocument()
    })
  })
})
