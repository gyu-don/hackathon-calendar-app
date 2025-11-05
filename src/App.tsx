import { useState, useEffect } from 'react'
import Calendar from './components/Calendar'
import './App.css'

type ViewMode = 'month' | 'week'

interface CalendarEvent {
  id: string
  summary: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
}

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  // Googleカレンダー連携を開始
  const handleGoogleConnect = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/google')
      const data = await response.json()
      // Google認証ページへリダイレクト
      window.location.href = data.authUrl
    } catch (error) {
      console.error('認証エラー:', error)
      alert('Googleカレンダー連携に失敗しました')
      setIsLoading(false)
    }
  }

  // カレンダーイベントを取得
  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      // 表示期間を計算
      const startDate = new Date(currentDate)
      startDate.setDate(1) // 月の最初
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(currentDate)
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(0) // 月の最後
      endDate.setHours(23, 59, 59, 999)

      const response = await fetch(
        `/api/calendar/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          credentials: 'include', // Cookieを含める
        }
      )

      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
        setIsAuthenticated(true)
      } else if (response.status === 401) {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('イベント取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 認証成功時の処理
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('auth') === 'success') {
      setIsAuthenticated(true)
      // URLからパラメータを削除
      window.history.replaceState({}, '', '/')
      // イベントを取得
      fetchEvents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // currentDateが変更されたらイベントを再取得
  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, isAuthenticated])

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
        {!isAuthenticated && (
          <button onClick={handleGoogleConnect} disabled={isLoading} className="google-connect-btn">
            {isLoading ? '接続中...' : 'Googleカレンダー連携'}
          </button>
        )}
        {isAuthenticated && (
          <button onClick={fetchEvents} disabled={isLoading} className="refresh-btn">
            {isLoading ? '更新中...' : '更新'}
          </button>
        )}
      </div>
      <Calendar currentDate={currentDate} viewMode={viewMode} events={events} />
    </div>
  )
}

export default App
