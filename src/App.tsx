import { useState } from 'react'
import Calendar from './components/Calendar'
import './App.css'

type ViewMode = 'month' | 'week'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setDate(newDate.getDate() - 7)
    }
    setCurrentDate(newDate)
  }

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>カレンダー</h1>
        <div className="view-mode-toggle">
          <button
            className={viewMode === 'month' ? 'active' : ''}
            onClick={() => setViewMode('month')}
          >
            月
          </button>
          <button
            className={viewMode === 'week' ? 'active' : ''}
            onClick={() => setViewMode('week')}
          >
            週
          </button>
        </div>
      </header>
      <div className="calendar-controls">
        <button onClick={goToPreviousPeriod}>前へ</button>
        <button onClick={goToToday}>今日</button>
        <button onClick={goToNextPeriod}>次へ</button>
      </div>
      <Calendar currentDate={currentDate} viewMode={viewMode} />
    </div>
  )
}

export default App
