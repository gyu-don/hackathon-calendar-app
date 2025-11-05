import type { Env, GoogleTokenResponse } from './types'

/**
 * Google OAuth2認証URLを生成
 */
export function generateAuthUrl(env: Env): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    access_type: 'offline',
    prompt: 'consent',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * 認可コードをアクセストークンに交換
 */
export async function exchangeCodeForToken(code: string, env: Env): Promise<GoogleTokenResponse> {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token'

  const params = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  })

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  return await response.json<GoogleTokenResponse>()
}

/**
 * セッションCookieを作成
 */
export function createSessionCookie(accessToken: string): string {
  // 本番環境では、暗号化や署名を追加することを推奨
  const session = JSON.stringify({
    accessToken,
    createdAt: Date.now(),
  })

  // Domain属性を追加して、すべての*.gyu-don.workers.devサブドメインでクッキーを共有
  // これにより、本番環境で認証した後、プレビュー環境でも認証情報を使い回せる
  return `session=${encodeURIComponent(session)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600; Domain=.gyu-don.workers.dev`
}

/**
 * Cookieからアクセストークンを取得
 */
export function getAccessTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    },
    {} as Record<string, string>
  )

  if (!cookies.session) return null

  try {
    const session = JSON.parse(decodeURIComponent(cookies.session))
    return session.accessToken
  } catch {
    return null
  }
}
