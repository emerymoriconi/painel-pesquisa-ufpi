import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'

const mockSair = vi.fn()

vi.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  NavLink: ({ to, children, onClick }) => <a href={to} onClick={onClick}>{children}</a>,
  useNavigate: () => vi.fn(),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ sair: mockSair, token: 'fake-token' }),
}))

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ dark: false, toggleTheme: vi.fn() }),
}))

function renderSidebar(isOpen = true) {
  return render(
    <MemoryRouter>
      <Sidebar isOpen={isOpen} onClose={vi.fn()} />
    </MemoryRouter>
  )
}

describe('Sidebar', () => {
  beforeEach(() => mockSair.mockReset())

  it('renderiza 10 links de navegação', () => {
    renderSidebar()
    expect(screen.getAllByRole('link')).toHaveLength(10)
  })

  it('botão logout está presente', () => {
    renderSidebar()
    expect(screen.getByText('Sair')).toBeInTheDocument()
  })

  it('labels dos links estão corretos', () => {
    renderSidebar()
    expect(screen.getByText('Geral')).toBeInTheDocument()
    expect(screen.getByText('Laboratórios')).toBeInTheDocument()
  })

  it('chama sair ao clicar em logout', () => {
    renderSidebar()
    fireEvent.click(screen.getByText('Sair'))
    expect(mockSair).toHaveBeenCalledTimes(1)
  })
})
