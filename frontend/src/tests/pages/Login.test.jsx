import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const mockNavigate = vi.hoisted(() => vi.fn())
const mockEntrar   = vi.hoisted(() => vi.fn())

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ entrar: mockEntrar }),
}))

vi.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  Link: ({ to, children, className }) => <a href={to} className={className}>{children}</a>,
  useNavigate: () => mockNavigate,
}))

import Login from '../../pages/Login'

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login', () => {
  beforeEach(() => {
    mockEntrar.mockReset()
    mockNavigate.mockReset()
  })

  it('campos username e password estão presentes', () => {
    renderLogin()
    expect(screen.getByLabelText('Usuário')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })

  it('botão Entrar está presente', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('mostra mensagem de erro ao falhar login', async () => {
    mockEntrar.mockResolvedValue({ sucesso: false, erro: 'Credenciais inválidas' })
    renderLogin()

    fireEvent.change(screen.getByLabelText('Usuário'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('Senha'),   { target: { value: 'errado' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Usuário ou senha inválidos.')).toBeInTheDocument()
    })
  })

  it('navega para / ao logar com sucesso', async () => {
    mockEntrar.mockResolvedValue({ sucesso: true })
    renderLogin()

    fireEvent.change(screen.getByLabelText('Usuário'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('Senha'),   { target: { value: 'certo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('entrar é chamado com os valores digitados', async () => {
    mockEntrar.mockResolvedValue({ sucesso: false })
    renderLogin()

    fireEvent.change(screen.getByLabelText('Usuário'), { target: { value: 'meuuser' } })
    fireEvent.change(screen.getByLabelText('Senha'),   { target: { value: 'minhasenha' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockEntrar).toHaveBeenCalledWith('meuuser', 'minhasenha')
    })
  })
})
