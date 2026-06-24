import { render } from '@testing-library/react'
import LoadingSpinner from '../../components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renderiza o spinner com tamanho md por padrão', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.firstChild.className).toContain('animate-spin')
    expect(container.firstChild.className).toContain('h-10')
  })

  it('tamanho sm aplica classes corretas', () => {
    const { container } = render(<LoadingSpinner size="sm" />)
    expect(container.firstChild.className).toContain('h-5')
  })

  it('tamanho lg aplica classes corretas', () => {
    const { container } = render(<LoadingSpinner size="lg" />)
    expect(container.firstChild.className).toContain('h-16')
  })

  it('fullPage envolve o spinner em wrapper centralizado', () => {
    const { container } = render(<LoadingSpinner fullPage />)
    expect(container.firstChild.className).toContain('min-h-screen')
    expect(container.firstChild.firstChild.className).toContain('animate-spin')
  })

  it('sem fullPage não existe wrapper min-h-screen', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.firstChild.className).not.toContain('min-h-screen')
  })
})
