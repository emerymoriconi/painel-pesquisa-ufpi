import { render, screen, fireEvent } from '@testing-library/react'
import FiltroTexto from '../../components/FiltroTexto'

describe('FiltroTexto', () => {
  it('renderiza o label', () => {
    render(<FiltroTexto label="Inventor" value="" onChange={() => {}} />)
    expect(screen.getByText('Inventor')).toBeInTheDocument()
  })

  it('renderiza o placeholder', () => {
    render(
      <FiltroTexto label="X" value="" onChange={() => {}} placeholder="Buscar…" />
    )
    expect(screen.getByPlaceholderText('Buscar…')).toBeInTheDocument()
  })

  it('reflete o value controlado', () => {
    render(<FiltroTexto label="X" value="texto inicial" onChange={() => {}} />)
    expect(screen.getByRole('textbox').value).toBe('texto inicial')
  })

  it('chama onChange ao digitar', () => {
    const onChange = vi.fn()
    render(<FiltroTexto label="X" value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'novo valor' } })
    expect(onChange).toHaveBeenCalledWith('novo valor')
  })

  it('não renderiza label quando prop não é passada', () => {
    const { container } = render(<FiltroTexto value="" onChange={() => {}} />)
    expect(container.querySelector('label')).toBeNull()
  })

  it('renderiza input do tipo text', () => {
    render(<FiltroTexto label="X" value="" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
  })
})
