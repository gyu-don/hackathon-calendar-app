import type { Env, GoogleTokenResponse } from './types'

/**
 * Google OAuth2認証URLを生成
 * @param env 環境変数
 * @param requestUrl リクエストURL（リダイレクトURIの構築に使用）
 */
export function generateAuthUrl(env: Env, requestUrl: URL): string {
  // リクエスト元のホストを使って動的にリダイレクトURIを構築
  const redirectUri = `${requestUrl.protocol}//${requestUrl.host}/api/auth/callback`

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    access_type: 'offline',
    prompt: 'consent',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * 認可コードをアクセストークンに交換
 * @param code 認可コード
 * @param env 環境変数
 * @param requestUrl リクエストURL（リダイレクトURIの構築に使用）
 */
export async function exchangeCodeForToken(
  code: string,
  env: Env,
  requestUrl: URL
): Promise<GoogleTokenResponse> {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token'

  // リクエスト元のホストを使って動的にリダイレクトURIを構築
  const redirectUri = `${requestUrl.protocol}//${requestUrl.host}/api/auth/callback`

  const params = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
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
 * @param accessToken アクセストークン
 * @param isSecure HTTPSかどうか（HTTPS環境ではSecure属性が必須）
 */
export function createSessionCookie(accessToken: string, isSecure: boolean): string {
  // 本番環境では、暗号化や署名を追加することを推奨
  const session = JSON.stringify({
    accessToken,
    createdAt: Date.now(),
  })

  // 基本的なCookie属性
  let cookieString = `session=${encodeURIComponent(session)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`

  // HTTPSの場合はSecure属性を追加
  if (isSecure) {
    cookieString += `; Secure`
  }

  // *.gyu-don.workers.devドメインの場合のみDomain属性を追加
  // これにより、本番環境で認証した後、プレビュー環境でも認証情報を使い回せる
  // Note: Domainを指定しない場合は、現在のホストにのみCookieが設定される
  cookieString += `; Domain=.gyu-don.workers.dev`

  return cookieString
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
