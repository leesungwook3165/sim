// ═══════════════════════════════════════════════════════════════════════════
//  camellia-fare (Cloudflare Worker)
//  fare_optimizer.html 전용 — 뉴카멜리아호(PUS↔FUK) 운임 조회 대행
//
//  라우트:
//    GET /camellia?...   → koreaferry.co.kr 2-step 세션 호출
//                          POST /rs/idv/reservation/index_post (세션 쿠키 수립)
//                          → GET /rs/idv/reservation/plan/{process}/{harbor}/{date}
//    그 외                → 404
//
//  필수 쿼리 (fare_optimizer.html 이 보내는 값):
//    oufuku   1=편도, 2=왕복
//    ow       2 (PUS)
//    ow_date  YYYY-MM-DD 가는 날짜
//    rt       1 (FUK)
//    rt_date  YYYY-MM-DD 오는 날짜 (편도면 빈 값)
//    number   인원수
//    process  1=가는편, 2=오는편
//    harbor   2=부산, 1=후쿠오카
//    date     YYYY-MM-DD 해당편 날짜
//
//  환경변수:
//    ALLOWED_ORIGIN  (선택) 허용할 Origin. 미설정이면 전체 허용.
//                    예: https://leesungwook.github.io
//
//  배포:
//    대시보드 → Workers → camellia-fare → Edit code → 전체 대체 → Deploy.
// ═══════════════════════════════════════════════════════════════════════════

const CAMELLIA_BASE = 'https://www.koreaferry.co.kr';
const CAMELLIA_POST = CAMELLIA_BASE + '/rs/idv/reservation/index_post';

function corsHeaders(origin, allowed) {
  const okOrigin = (!allowed || !origin || origin === allowed) ? (origin || '*') : 'null';
  return {
    'Access-Control-Allow-Origin':  okOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary':                         'Origin',
  };
}

// koreaferry.co.kr 의 예약 조회는 세션 쿠키 필수인 2-step 구조.
//   Step 1 : POST index_post       → Set-Cookie 로 세션 수립
//   Step 2 : GET  plan/{...}       → 등급별 가격 HTML 반환
// CF Worker 의 fetch() 는 자동 쿠키 처리가 없으므로 Set-Cookie 를 수동 수거/전송.
async function handleCamellia(request, cors) {
  const q = new URL(request.url).searchParams;

  const postFields = new URLSearchParams({
    oufuku:  q.get('oufuku')  || '1',
    ow:      q.get('ow')      || '2',
    ow_date: q.get('ow_date') || '',
    rt:      q.get('rt')      || '1',
    rt_date: q.get('rt_date') || '',
    number:  q.get('number')  || '1',
  });

  const commonHeaders = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) camellia-fare-worker',
    'Accept-Language': 'ko-KR,ko;q=0.9',
    'Accept':          'text/html,application/xhtml+xml',
    'Referer':         CAMELLIA_BASE + '/',
  };

  // Step 1 : POST 세션 수립
  const postResp = await fetch(CAMELLIA_POST, {
    method:   'POST',
    body:     postFields.toString(),
    headers:  { ...commonHeaders, 'Content-Type': 'application/x-www-form-urlencoded' },
    redirect: 'manual',
  });

  // Set-Cookie 수거 — getSetCookie() (2023+) 우선, 폴백도 준비
  let setCookies = [];
  if (typeof postResp.headers.getSetCookie === 'function') {
    setCookies = postResp.headers.getSetCookie();
  } else {
    const raw = postResp.headers.get('set-cookie') || '';
    setCookies = raw.split(/,(?=\s*[A-Za-z0-9_\-]+=)/);
  }
  const cookieStr = setCookies
    .map(c => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');

  try { await postResp.arrayBuffer(); } catch (_) {}

  // Step 2 : GET plan HTML
  const process = encodeURIComponent(q.get('process') || '1');
  const harbor  = encodeURIComponent(q.get('harbor')  || '2');
  const date    = encodeURIComponent(q.get('date')    || q.get('ow_date') || '');
  const planUrl = `${CAMELLIA_BASE}/rs/idv/reservation/plan/${process}/${harbor}/${date}`;

  const getResp = await fetch(planUrl, {
    headers: { ...commonHeaders, 'Cookie': cookieStr },
  });
  const html = await getResp.text();

  return new Response(html, {
    status:  getResp.status,
    headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8' },
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

    const url = new URL(request.url);
    if (!url.pathname.startsWith('/camellia')) {
      return new Response('Not found — /camellia only', {
        status: 404,
        headers: { ...cors, 'Content-Type': 'text/plain' },
      });
    }

    try {
      return await handleCamellia(request, cors);
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e && e.message || e) }), {
        status:  500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  },
};
