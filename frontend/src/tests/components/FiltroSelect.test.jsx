import { render, screen, fireEvent } from '@testing-library/react'
import FiltroSelect from '../../components/FiltroSelect'

const options = [
  { value: 'a', label: 'Opção A' },
  { value: 'b', label: 'Opção B' },
]

describe('FiltroSelect', () => {
  it('renderiza o label', () => {
    render(<FiltroSelect label="Centro" value="" onChange={() => {}} options={options} />)
    expect(screen.getByText('Centro')).toBeInTheDocument()
  })

  it('sempre inclui a opção "Todos"', () => {
    render(<FiltroSelect label="X" value="" onChange={() => {}} options={options} />)
    expect(screen.getByRole('option', { name: 'Todos' })).toBeInTheDocument()
  })

  it('renderiza todas as opções passadas', () => {
    render(<FiltroSelect label="X" value="" onChange={() => {}} options={options} />)
    expect(screen.getByRole('option', { name: 'Opção A' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Opção B' })).toBeInTheDocument()
  })

  it('chama onChange com o valor selecionado', () => {
    const onChange = vi.fn()
    render(<FiltroSelect label="X" value="" onChange={onChange} options={options} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } })
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('desabilita o select quando disabled=true', () => {
    render(<FiltroSelect label="X" value="" onChange={() => {}} options={options} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('não renderiza label quando prop não é passada', () => {
    const { container } = render(
      <FiltroSelect value="" onChange={() => {}} options={[]} />
    )
    expect(container.querySelector('label')).toBeNull()
  })

  it('renderiza sem opções além de "Todos"', () => {
    render(<FiltroSelect label="X" value="" onChange={() => {}} options={[]} />)
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })

  it('reflete o value controlado', () => {
    render(<FiltroSelect label="X" value="b" onChange={() => {}} options={options} />)
    expect(screen.getByRole('combobox').value).toBe('b')
  })
})
