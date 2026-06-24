import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../context/AuthContext'

vi.mock('../../api/index.js', () => ({
  login: vi.fn(),
}))

import { login as apiLogin } from '../../api/index.js'

function Probe() {
  const { token, entrar, sair } = useAuth()
  return (
    <div>
      <span data-testid="token">{token ?? 'sem-token'}</span>
      <button onClick={() => entrar('u', 'p')}>entrar</button>
      <button onClick={sair}>sair</button>
    </div>
  )
}

function ProbeResultado() {
  const { entrar } = useAuth()
  const [resultado, setResultado] = React.useState(null)
  return (
    <div>
      <button onClick={async () => setResultado(await entrar('x', 'y'))}>entrar</button>
      {resultado && (
        <span data-testid="resultado">
          {resultado.sucesso ? 'ok' : resultado.erro}
        </span>
      )}
    </div>
  )
}

import React from 'react'

function renderCtx() {
  return render(<AuthProvider><Probe /></AuthProvider>)
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    apiLogin.mockReset()
  })

  it('token inicial é null sem localStorage', () => {
    renderCtx()
    expect(screen.getByTestId('token').textContent).toBe('sem-token')
  })

  it('token inicial é lido do localStorage', () => {
    localStorage.setItem('token', 'tok-persistido')
    renderCtx()
    expect(screen.getByTestId('token').textContent).toBe('tok-persistido')
  })

  it('entrar com sucesso salva token no estado e localStorage', async () => {
    apiLogin.mockResolvedValue({ access_token: 'novo-token' })
    renderCtx()
    await act(async () => { screen.getByText('entrar').click() })
    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('novo-token')
      expect(localStorage.getItem('token')).toBe('novo-token')
    })
  })

  it('entrar com sucesso retorna { sucesso: true }', async () => {
    apiLogin.mockResolvedValue({ access_token: 'tok' })
    render(
      <AuthProvider>
        <ProbeResultado />
      </AuthProvider>
    )
    await act(async () => { screen.getByText('entrar').click() })
    await waitFor(() =>
      expect(screen.getByTestId('resultado').textContent).toBe('ok')
    )
  })

  it('entrar com falha retorna { sucesso: false, erro } da API', async () => {
    apiLogin.mockRejectedValue({
      response: { data: { detail: 'Credenciais inválidas' } },
    })
    render(
      <AuthProvider>
        <ProbeResultado />
      </AuthProvider>
    )
    await act(async () => { screen.getByText('entrar').click() })
    await waitFor(() =>
      expect(screen.getByTestId('resultado').textContent).toBe(
        'Credenciais inválidas'
      )
    )
  })

  it('entrar com falha sem response.data usa mensagem padrão', async () => {
    apiLogin.mockRejectedValue(new Error('Network error'))
    render(
      <AuthProvider>
        <ProbeResultado />
      </AuthProvider>
    )
    await act(async () => { screen.getByText('entrar').click() })
    await waitFor(() =>
      expect(screen.getByTestId('resultado').textContent).toContain(
        'Erro ao conectar'
      )
    )
  })

  it('sair remove token do estado e localStorage', async () => {
    localStorage.setItem('token', 'tok123')
    renderCtx()
    await act(async () => { screen.getByText('sair').click() })
    expect(screen.getByTestId('token').textContent).toBe('sem-token')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('useAuth lança erro fora do provider', () => {
    function Fora() {
      useAuth()
      return null
    }
    expect(() => render(<Fora />)).toThrow()
  })
})
