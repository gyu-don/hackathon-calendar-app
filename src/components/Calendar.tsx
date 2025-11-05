import { useMemo } from 'react'
import './Calendar.css'

type ViewMode = 'month' | 'week'

interface CalendarProps {
  currentDate: Date
  viewMode: ViewMode
}

const Calendar = ({ currentDate, viewMode }: CalendarProps) => {
  const { year, month, displayMonth } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const displayMonth = month + 1
    return { year, month, displayMonth }
  }, [currentDate])

  const weeks = useMemo(() => {
    if (viewMode === 'month') {
      return generateMonthWeeks(year, month)
    } else {
      return generateWeekDays(currentDate)
    }
  }, [year, month, currentDate, viewMode])

  return (
    <div className="calendar">
      <div className="calendar-title">
        {year}年 {displayMonth}月
      </div>
      <div className="calendar-grid">
        <div className="calendar-header">
          <div className="calendar-day-name">日</div>
          <div className="calendar-day-name">月</div>
          <div className="calendar-day-name">火</div>
          <div className="calendar-day-name">水</div>
          <div className="calendar-day-name">木</div>
          <div className="calendar-day-name">金</div>
          <div className="calendar-day-name">土</div>
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="calendar-week">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`calendar-day ${day.isCurrentMonth ? '' : 'other-month'} ${
                  day.isToday ? 'today' : ''
                }`}
              >
                <div className="day-number">{day.date}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface DayInfo {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  fullDate: Date
}

function generateMonthWeeks(year: number, month: number): DayInfo[][] {
  const weeks: DayInfo[][] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const prevMonthLastDay = new Date(year, month, 0).getDate()

  let currentWeek: DayInfo[] = []

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = prevMonthLastDay - i
    const fullDate = new Date(year, month - 1, date)
    fullDate.setHours(0, 0, 0, 0)
    currentWeek.push({
      date,
      isCurrentMonth: false,
      isToday: fullDate.getTime() === today.getTime(),
      fullDate,
    })
  }

  for (let date = 1; date <= daysInMonth; date++) {
    const fullDate = new Date(year, month, date)
    fullDate.setHours(0, 0, 0, 0)
    currentWeek.push({
      date,
      isCurrentMonth: true,
      isToday: fullDate.getTime() === today.getTime(),
      fullDate,
    })

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  let nextMonthDate = 1
  while (currentWeek.length > 0 && currentWeek.length < 7) {
    const fullDate = new Date(year, month + 1, nextMonthDate)
    fullDate.setHours(0, 0, 0, 0)
    currentWeek.push({
      date: nextMonthDate,
      isCurrentMonth: false,
      isToday: fullDate.getTime() === today.getTime(),
      fullDate,
    })
    nextMonthDate++
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return weeks
}

function generateWeekDays(currentDate: Date): DayInfo[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dayOfWeek = currentDate.getDay()
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - dayOfWeek)
  startOfWeek.setHours(0, 0, 0, 0)

  const week: DayInfo[] = []
  const currentMonth = currentDate.getMonth()

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    date.setHours(0, 0, 0, 0)

    week.push({
      date: date.getDate(),
      isCurrentMonth: date.getMonth() === currentMonth,
      isToday: date.getTime() === today.getTime(),
      fullDate: date,
    })
  }

  return [week]
}

export default Calendar
