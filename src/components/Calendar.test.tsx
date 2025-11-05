import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Calendar from './Calendar'

describe('Calendar', () => {
  it('renders month view', () => {
    const currentDate = new Date(2025, 10, 5) // 2025年11月5日
    render(<Calendar currentDate={currentDate} viewMode="month" />)

    expect(screen.getByText('2025年 11月')).toBeInTheDocument()
    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
    expect(screen.getByText('火')).toBeInTheDocument()
  })

  it('renders week view', () => {
    const currentDate = new Date(2025, 10, 5)
    render(<Calendar currentDate={currentDate} viewMode="week" />)

    expect(screen.getByText('2025年 11月')).toBeInTheDocument()
  })

  it('highlights today', () => {
    const today = new Date()
    render(<Calendar currentDate={today} viewMode="month" />)

    const todayElements = screen.getAllByText(today.getDate().toString())
    const todayElement = todayElements.find((el) =>
      el.closest('.calendar-day')?.classList.contains('today')
    )
    expect(todayElement).toBeDefined()
  })
})
