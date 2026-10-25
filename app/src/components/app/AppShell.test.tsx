import type { ComponentProps } from 'react'
import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AppShell from './AppShell'

const useLocationMock = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useLocation: () => useLocationMock(),
    Outlet: () => <div data-testid="outlet" />,
    Link: ({ children, ...props }: ComponentProps<'a'>) => <a {...props}>{children}</a>,
    NavLink: ({ children, ...props }: ComponentProps<'a'>) => <a {...props}>{children}</a>,
  }
})

vi.mock('@/components/app/CommandBar', () => ({
  CommandBar: () => null,
}))

vi.mock('@/components/Logo', () => ({
  default: () => <div data-testid="logo" />,
}))

vi.mock('@/components/app/Chips', () => ({
  CountBadge: () => null,
  HealthDot: () => null,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))

describe('AppShell', () => {
  beforeEach(() => {
    useLocationMock.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('scrolls the main content pane back to the top when the route changes', async () => {
    const scrollToSpy = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollToSpy,
    })

    useLocationMock.mockReturnValue({ pathname: '/relationships' })
    const { rerender } = render(<AppShell />)

    await waitFor(() => {
      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
    })

    useLocationMock.mockReturnValue({ pathname: '/dashboard' })
    rerender(<AppShell />)

    await waitFor(() => {
      expect(scrollToSpy).toHaveBeenCalledTimes(2)
    })
  })
})
