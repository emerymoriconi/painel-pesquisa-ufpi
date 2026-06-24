import { render, screen, fireEvent } from '@testing-library/react'
import CardMetrica from '../../components/CardMetrica'

describe('CardMetrica', () => {
  it('renderiza título e valor', () => {
    render(<CardMetrica titulo="Projetos" valor={42} />)
    expect(screen.getByText('Projetos')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('valor zero não quebra', () => {
    render(<CardMetrica titulo="Nada" valor={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('chama onClick ao clicar', () => {
    const fn = vi.fn()
    render(<CardMetrica titulo="Clicável" valor={5} onClick={fn} />)
    fireEvent.click(screen.getByText('Clicável'))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('subtítulo aparece quando passado', () => {
    render(<CardMetrica titulo="X" valor={1} subtitulo="Detalhe aqui" />)
    expect(screen.getByText('Detalhe aqui')).toBeInTheDocument()
  })

  it('subtítulo não aparece sem a prop', () => {
    render(<CardMetrica titulo="X" valor={1} />)
    expect(screen.queryByText('Detalhe aqui')).not.toBeInTheDocument()
  })
})
