// ═══════════════════════════════════════════════════════════════════════════
//  fare-worker (Cloudflare Worker)
//  fare_optimizer.html 전용 — SerpApi google_flights 호출 대행
//
//  라우트:
//    GET /?engine=google_flights&...   → SerpApi 투명 전달
//                                        (api_key 는 서버 측에서 주입)
//    OPTIONS                           → CORS preflight
//
//  필수 환경변수:
//    SERPAPI_KEY     SerpApi API 키 (대시보드 → Settings → Variables → Encrypt)
//
//  선택 환경변수:
//    ALLOWED_ORIGIN  허용할 Origin. 미설정이면 전체 허용.
//                    예: https://leesungwook.github.io
//
//  배포:
//    대시보드 → Workers → fare-worker → Edit code → 전체 대체 → Deploy.
//    Variables 탭에서 SERPAPI_KEY 설정 필수.
// ═══════════════════════════════════════════════════════════════════════════

const SERPAPI_BASE = 'https://serpapi.com/search.json';

function corsHeaders(origin, allowed) {
  const okOrigin = (!allowed || !origin || origin === allowed) ? (origin || '*') : 'null';
  return {
    'Access-Control-Allow-Origin':  okOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary':                         'Origin',
  };
}

async function handleSerpApi(request, env, cors) {
  if (!env.SERPAPI_KEY) {
    return new Response(JSON.stringify({ error: 'SERPAPI_KEY 환경변수가 설정되지 않음' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
  const inUrl  = new URL(request.url);
  const outUrl = new URL(SERPAPI_BASE);
  // 클라이언트가 보낸 쿼리 통과 — 혹시 포함된 api_key 는 무시, 서버값으로 덮어씀
  for (const [k, v] of inUrl.searchParams.entries()) {
    if (k.toLowerCase() === 'api_key') continue;
    outUrl.searchParams.set(k, v);
  }
  outUrl.searchParams.set('api_key', env.SERPAPI_KEY);
  const r = await fetch(outUrl.toString(), {
    headers: { 'User-Agent': 'Mozilla/5.0 fare-worker' },
  });
  const body = await r.text();
  return new Response(body, {
    status:  r.status,
    headers: { ...cors, 'Content-Type': r.headers.get('Content-Type') || 'application/json' },
  });
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const cors   = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }
    if (env.ALLOWED_ORIGIN && origin && origin !== env.ALLOWED_ORIGIN) {
      return new Response('Forbidden', { status: 403, headers: { ...cors, 'Content-Type': 'text/plain' } });
    }

    try {
      return await handleSerpApi(request, env, cors);
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e && e.message || e) }), {
        status:  500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  },
};
