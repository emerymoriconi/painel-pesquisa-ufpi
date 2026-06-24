import { render } from '@testing-library/react'
import SkeletonCard from '../../components/SkeletonCard'

describe('SkeletonCard', () => {
  it('renderiza com classe animate-pulse', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.firstChild.className).toContain('animate-pulse')
  })

  it('renderiza com altura h-36', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.firstChild.className).toContain('h-36')
  })
})
