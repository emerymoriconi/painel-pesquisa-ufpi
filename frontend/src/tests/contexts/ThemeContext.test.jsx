import { render, screen, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../../context/ThemeContext'

function Probe() {
  const { dark, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="modo">{dark ? 'escuro' : 'claro'}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('inicia em modo claro quando localStorage não tem tema', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByTestId('modo').textContent).toBe('claro')
  })

  it('inicia em modo escuro quando localStorage contém "dark"', () => {
    localStorage.setItem('theme', 'dark')
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByTestId('modo').textContent).toBe('escuro')
  })

  it('toggle muda de claro para escuro', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    act(() => { screen.getByText('toggle').click() })
    expect(screen.getByTestId('modo').textContent).toBe('escuro')
  })

  it('toggle adiciona classe "dark" no documentElement', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    act(() => { screen.getByText('toggle').click() })
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggle persiste tema "dark" no localStorage', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    act(() => { screen.getByText('toggle').click() })
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('toggle duplo retorna ao modo claro', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    act(() => { screen.getByText('toggle').click() })
    act(() => { screen.getByText('toggle').click() })
    expect(screen.getByTestId('modo').textContent).toBe('claro')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('toggle duplo remove classe "dark" do documentElement', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    act(() => { screen.getByText('toggle').click() })
    act(() => { screen.getByText('toggle').click() })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('useTheme lança erro fora do provider', () => {
    function Fora() {
      useTheme()
      return null
    }
    expect(() => render(<Fora />)).toThrow()
  })
})
