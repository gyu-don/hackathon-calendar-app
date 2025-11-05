export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // CORSヘッダーを設定
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    // プリフライトリクエストの処理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      })
    }

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

    // 404
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders,
    })
  },
}
