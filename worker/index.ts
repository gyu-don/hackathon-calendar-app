import type { Env } from './types'
import {
  generateAuthUrl,
  exchangeCodeForToken,
  createSessionCookie,
  getAccessTokenFromCookie,
} from './auth'
import { fetchCalendarEvents } from './calendar'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // CORSヘッダーを設定
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    }

    // プリフライトリクエストの処理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      })
    }

    try {
      // ルーティング
      if (url.pathname === '/api/health') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      // Google OAuth2認証を開始
      if (url.pathname === '/api/auth/google') {
        const authUrl = generateAuthUrl(env, url)
        return new Response(JSON.stringify({ authUrl }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        })
      }

      // OAuth2コールバック
      if (url.pathname === '/api/auth/callback') {
        console.log('[OAuth Debug] Callback received:', {
          url: url.href,
          hasCode: !!url.searchParams.get('code'),
          hasError: !!url.searchParams.get('error'),
        })

        const code = url.searchParams.get('code')
        const error = url.searchParams.get('error')

        if (error) {
          console.error('[OAuth Debug] OAuth error:', error)
          // エラー時は絶対URLでリダイレクト
          const redirectUrl = `${url.protocol}//${url.host}/?auth=error&message=${encodeURIComponent(error)}`
          return new Response(null, {
            status: 302,
            headers: {
              Location: redirectUrl,
              ...corsHeaders,
            },
          })
        }

        if (!code) {
          console.error('[OAuth Debug] No authorization code found')
          const redirectUrl = `${url.protocol}//${url.host}/?auth=error&message=no_code`
          return new Response(null, {
            status: 302,
            headers: {
              Location: redirectUrl,
              ...corsHeaders,
            },
          })
        }

        try {
          console.log('[OAuth Debug] Exchanging code for token...')
          const tokenResponse = await exchangeCodeForToken(code, env, url)
          console.log('[OAuth Debug] Token exchange successful')

          const sessionCookie = createSessionCookie(tokenResponse.access_token, url)
          console.log('[OAuth Debug] Session cookie created')

          // フロントエンドに絶対URLでリダイレクト
          const redirectUrl = `${url.protocol}//${url.host}/?auth=success`
          console.log('[OAuth Debug] Redirecting to:', redirectUrl)

          return new Response(null, {
            status: 302,
            headers: {
              Location: redirectUrl,
              'Set-Cookie': sessionCookie,
              ...corsHeaders,
            },
          })
        } catch (error) {
          console.error('[OAuth Debug] Token exchange failed:', error)
          const errorMessage = error instanceof Error ? error.message : 'unknown_error'
          const redirectUrl = `${url.protocol}//${url.host}/?auth=error&message=${encodeURIComponent(errorMessage)}`
          return new Response(null, {
            status: 302,
            headers: {
              Location: redirectUrl,
              ...corsHeaders,
            },
          })
        }
      }

      // カレンダーイベント取得
      if (url.pathname === '/api/calendar/events') {
        const accessToken = getAccessTokenFromCookie(request.headers.get('Cookie'))

        if (!accessToken) {
          return new Response(JSON.stringify({ error: 'Not authenticated' }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          })
        }

        const startDate = url.searchParams.get('startDate') || undefined
        const endDate = url.searchParams.get('endDate') || undefined

        const events = await fetchCalendarEvents(accessToken, startDate, endDate)

        return new Response(JSON.stringify({ events }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        })
      }

      // 404
      return new Response('Not Found', {
        status: 404,
        headers: corsHeaders,
      })
    } catch (error) {
      console.error('Worker error:', error)
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }
  },
}
