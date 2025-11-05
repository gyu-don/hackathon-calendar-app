import type { CalendarEventsResponse, GoogleCalendarEvent } from './types'

/**
 * Google Calendar APIから予定を取得
 */
export async function fetchCalendarEvents(
  accessToken: string,
  startDate?: string,
  endDate?: string
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    orderBy: 'startTime',
    singleEvents: 'true',
    maxResults: '250',
  })

  if (startDate) {
    params.append('timeMin', startDate)
  }

  if (endDate) {
    params.append('timeMax', endDate)
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Calendar API request failed: ${error}`)
  }

  const data = await response.json<CalendarEventsResponse>()
  return data.items || []
}
