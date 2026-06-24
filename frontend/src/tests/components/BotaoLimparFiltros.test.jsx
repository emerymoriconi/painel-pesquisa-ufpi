import { render, screen, fireEvent } from '@testing-library/react'
import BotaoLimparFiltros from '../../components/BotaoLimparFiltros'

describe('BotaoLimparFiltros', () => {
  it('renderiza o botão', () => {
    render(<BotaoLimparFiltros onClick={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('texto do botão contém "Limpar Filtros"', () => {
    render(<BotaoLimparFiltros onClick={() => {}} />)
    expect(screen.getByRole('button').textContent).toContain('Limpar Filtros')
  })

  it('chama onClick ao clicar', () => {
    const onClick = vi.fn()
    render(<BotaoLimparFiltros onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('não chama onClick sem interação', () => {
    const onClick = vi.fn()
    render(<BotaoLimparFiltros onClick={onClick} />)
    expect(onClick).not.toHaveBeenCalled()
  })
})
