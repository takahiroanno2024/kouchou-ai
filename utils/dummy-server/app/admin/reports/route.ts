export async function GET(request: Request) {
  const requestApiKey = request.headers.get('x-api-key')
  const validApiKey = process.env.ADMIN_API_KEY
  if (!requestApiKey || requestApiKey !== validApiKey) {
    return new Response(null, {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
  // admin では全てのステータスのレポートを返す
  const data = [
    {
      slug: 'example',
      status: 'ready',
      title: '[テスト]人類が人工知能を開発・展開する上で、最優先すべき課題は何でしょうか？',
      description: 'あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。',
      isPubcom: true,
    },
    {
      slug: 'example2',
      status: 'ready',
      title: '[テスト]テストデータその２：このデータは空です',
      description: 'このデータは空です。詳細ページには飛べません',
      isPubcom: false,
    },
    {
      slug: 'processing',
      status: 'processing',
      title: '[テスト]出力中のレポート',
    },
  ]
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export async function POST(request: Request) {
  const requestApiKey = request.headers.get('x-api-key')
  const validApiKey = process.env.ADMIN_API_KEY
  if (!requestApiKey || requestApiKey !== validApiKey) {
    return new Response(null, {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
  return new Response(null, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key'
    }
  })
}
