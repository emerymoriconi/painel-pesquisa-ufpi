import { render, screen } from '@testing-library/react'
import TooltipGrafico from '../../components/TooltipGrafico'

const payload = [{ value: 50, color: '#1E3A5F', name: 'Total' }]

describe('TooltipGrafico', () => {
  it('não renderiza nada quando active é false', () => {
    const { container } = render(
      <TooltipGrafico active={false} payload={payload} label="2023" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('não renderiza nada com payload vazio', () => {
    const { container } = render(
      <TooltipGrafico active={true} payload={[]} label="2023" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('não renderiza nada sem payload', () => {
    const { container } = render(
      <TooltipGrafico active={true} label="2023" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renderiza label e valor quando active', () => {
    render(<TooltipGrafico active={true} payload={payload} label="2023" />)
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText(/Total: 50/)).toBeInTheDocument()
  })

  it('exibe percentual quando total é passado', () => {
    render(
      <TooltipGrafico active={true} payload={payload} label="X" total={100} />
    )
    expect(screen.getByText(/50\.0%/)).toBeInTheDocument()
  })

  it('não exibe percentual quando total não é passado', () => {
    render(<TooltipGrafico active={true} payload={payload} label="X" />)
    expect(screen.queryByText(/%/)).toBeNull()
  })

  it('usa formatarValor quando fornecido', () => {
    render(
      <TooltipGrafico
        active={true}
        payload={payload}
        label="X"
        formatarValor={(v) => `R$ ${v} Mi`}
      />
    )
    expect(screen.getByText(/R\$ 50 Mi/)).toBeInTheDocument()
  })

  it('renderiza múltiplos itens no payload', () => {
    const multi = [
      { value: 10, color: '#111', name: 'A' },
      { value: 20, color: '#222', name: 'B' },
    ]
    render(<TooltipGrafico active={true} payload={multi} label="Y" />)
    expect(screen.getByText(/A: 10/)).toBeInTheDocument()
    expect(screen.getByText(/B: 20/)).toBeInTheDocument()
  })
})
