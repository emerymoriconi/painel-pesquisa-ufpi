import { render } from '@testing-library/react'
import SkeletonTabela from '../../components/SkeletonTabela'

describe('SkeletonTabela', () => {
  it('tem classe animate-pulse', () => {
    const { container } = render(<SkeletonTabela />)
    expect(container.firstChild.className).toContain('animate-pulse')
  })

  it('renderiza 5 linhas por padrão (1 header + 5 itens = 6 filhos)', () => {
    const { container } = render(<SkeletonTabela />)
    expect(container.firstChild.children.length).toBe(6)
  })

  it('renderiza número de linhas customizado', () => {
    const { container } = render(<SkeletonTabela linhas={3} />)
    expect(container.firstChild.children.length).toBe(4) // 1 header + 3
  })

  it('renderiza zero linhas além do header', () => {
    const { container } = render(<SkeletonTabela linhas={0} />)
    expect(container.firstChild.children.length).toBe(1)
  })
})
