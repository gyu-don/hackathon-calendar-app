import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders calendar app', () => {
    render(<App />)
    expect(screen.getByText('カレンダー')).toBeInTheDocument()
  })

  it('switches between month and week view', () => {
    const { container } = render(<App />)

    const viewModeToggle = container.querySelector('.view-mode-toggle')
    const buttons = viewModeToggle?.querySelectorAll('button')
    const monthButton = buttons?.[0]
    const weekButton = buttons?.[1]

    expect(monthButton).toHaveClass('active')
    expect(weekButton).not.toHaveClass('active')

    if (weekButton) {
      fireEvent.click(weekButton)
    }

    expect(weekButton).toHaveClass('active')
    expect(monthButton).not.toHaveClass('active')
  })

  it('has navigation buttons', () => {
    render(<App />)

    expect(screen.getByText('前へ')).toBeInTheDocument()
    expect(screen.getByText('今日')).toBeInTheDocument()
    expect(screen.getByText('次へ')).toBeInTheDocument()
  })
})
