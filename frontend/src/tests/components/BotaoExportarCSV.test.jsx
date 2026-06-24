import { render, screen, fireEvent } from '@testing-library/react'
import BotaoExportarCSV from '../../components/BotaoExportarCSV'

const colunas = [
  { key: 'nome',  label: 'NOME' },
  { key: 'valor', label: 'VALOR' },
]

const dados = [
  { nome: 'Item A',  valor: '100' },
  { nome: 'Item,B', valor: '200' }, // vírgula → deve ser escapada com aspas
]

describe('BotaoExportarCSV', () => {
  let mockAnchor

  beforeEach(() => {
    mockAnchor = { href: '', download: '', click: vi.fn() }
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return mockAnchor
      return document.createElement.wrappedMethod
        ? document.createElement.wrappedMethod(tag)
        : Object.getPrototypeOf(document).createElement.call(document, tag)
    })
  })

  afterEach(() => vi.restoreAllMocks())

  it('renderiza o botão com texto CSV', () => {
    render(<BotaoExportarCSV dados={dados} nomeArquivo="teste" colunas={colunas} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByRole('button').textContent).toContain('CSV')
  })

  it('chama URL.createObjectURL ao clicar', () => {
    render(<BotaoExportarCSV dados={dados} nomeArquivo="teste" colunas={colunas} />)
    fireEvent.click(screen.getByRole('button'))
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
  })

  it('chama URL.revokeObjectURL após criar o link', () => {
    render(<BotaoExportarCSV dados={dados} nomeArquivo="teste" colunas={colunas} />)
    fireEvent.click(screen.getByRole('button'))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('o download tem o nome correto com extensão .csv', () => {
    render(<BotaoExportarCSV dados={dados} nomeArquivo="meu_export" colunas={colunas} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockAnchor.download).toMatch(/^meu_export_/)
    expect(mockAnchor.download).toMatch(/\.csv$/)
  })

  it('funciona com dados vazios', () => {
    render(<BotaoExportarCSV dados={[]} nomeArquivo="vazio" colunas={colunas} />)
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow()
  })
})
