import { render, screen, fireEvent } from '@testing-library/react'
import TabelaPaginada from '../components/TabelaPaginada'

const colunas = [
  { key: 'nome',  label: 'NOME' },
  { key: 'valor', label: 'VALOR' },
]

const dados = [
  { nome: 'Item A', valor: '100' },
  { nome: 'Item B', valor: '200' },
]

describe('TabelaPaginada', () => {
  it('renderiza headers corretos', () => {
    render(<TabelaPaginada colunas={colunas} dados={dados} />)
    expect(screen.getByText('NOME')).toBeInTheDocument()
    expect(screen.getByText('VALOR')).toBeInTheDocument()
  })

  it('renderiza dados corretamente', () => {
    render(<TabelaPaginada colunas={colunas} dados={dados} />)
    expect(screen.getByText('Item A')).toBeInTheDocument()
    expect(screen.getByText('Item B')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('mostra emptyMessage quando dados vazio', () => {
    render(
      <TabelaPaginada
        colunas={colunas}
        dados={[]}
        emptyMessage="Sem registros"
      />
    )
    expect(screen.getByText('Sem registros')).toBeInTheDocument()
  })

  it('mostra mensagem padrão quando dados vazio e sem emptyMessage', () => {
    render(<TabelaPaginada colunas={colunas} dados={[]} />)
    expect(screen.getByText('Nenhum registro encontrado')).toBeInTheDocument()
  })

  it('botão Anterior chama onAnterior', () => {
    const onAnterior = vi.fn()
    render(
      <TabelaPaginada
        colunas={colunas}
        dados={dados}
        pagina={2}
        totalPaginas={3}
        onAnterior={onAnterior}
        onProxima={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Anterior'))
    expect(onAnterior).toHaveBeenCalledTimes(1)
  })

  it('botão Próxima chama onProxima', () => {
    const onProxima = vi.fn()
    render(
      <TabelaPaginada
        colunas={colunas}
        dados={dados}
        pagina={1}
        totalPaginas={3}
        onAnterior={vi.fn()}
        onProxima={onProxima}
      />
    )
    fireEvent.click(screen.getByText('Próxima'))
    expect(onProxima).toHaveBeenCalledTimes(1)
  })

  it('botão Anterior desabilitado na página 1', () => {
    render(
      <TabelaPaginada
        colunas={colunas}
        dados={dados}
        pagina={1}
        totalPaginas={3}
        onAnterior={vi.fn()}
        onProxima={vi.fn()}
      />
    )
    expect(screen.getByText('Anterior')).toBeDisabled()
  })

  it('botão Próxima desabilitado na última página', () => {
    render(
      <TabelaPaginada
        colunas={colunas}
        dados={dados}
        pagina={3}
        totalPaginas={3}
        onAnterior={vi.fn()}
        onProxima={vi.fn()}
      />
    )
    expect(screen.getByText('Próxima')).toBeDisabled()
  })

  it('exibe indicador de página corretamente', () => {
    render(
      <TabelaPaginada
        colunas={colunas}
        dados={dados}
        pagina={2}
        totalPaginas={5}
      />
    )
    expect(screen.getByText('Página 2 de 5')).toBeInTheDocument()
  })

  it('col.render é chamado quando fornecido', () => {
    const colunasComRender = [
      { key: 'nome', label: 'NOME', render: (v) => `[${v}]` },
    ]
    render(<TabelaPaginada colunas={colunasComRender} dados={[{ nome: 'Teste' }]} />)
    expect(screen.getByText('[Teste]')).toBeInTheDocument()
  })
})
