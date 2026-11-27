"""
fare_optimizer.html 전용 로컬 프록시 서버 — CORS 우회용.

사용법:
    # 기존 `python -m http.server 3000` 대신 이걸 실행
    python proxy_server.py

구조:
    /                → fare_optimizer.html 기본 페이지
    /<file>          → 정적 파일 그대로 (SimpleHTTPRequestHandler 상속)
    /serpapi?...     → https://serpapi.com/search.json 으로 투명 프록시
                       (CORS 헤더 자동 추가, 응답 그대로 전달)
    /camellia?...    → koreaferry.co.kr 2-step 세션 호출 대행
                       POST index_post (세션 쿠키 수립) → GET plan HTML
                       쿼리 파라미터: oufuku, ow, ow_date, rt, rt_date, number,
                                      process, harbor, date

의존성: Python 표준 라이브러리만 — pip install 없음.
포트: 3000 (환경변수 PORT 로 변경 가능)
"""

import os
import sys
import http.cookiejar
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, urlencode
from urllib.request import Request, urlopen, build_opener, HTTPCookieProcessor
from urllib.error import HTTPError, URLError


SERPAPI_BASE = 'https://serpapi.com/search.json'
CAMELLIA_BASE = 'https://www.koreaferry.co.kr'
CAMELLIA_POST = CAMELLIA_BASE + '/rs/idv/reservation/index_post'
CAMELLIA_PLAN_FMT = CAMELLIA_BASE + '/rs/idv/reservation/plan/{process}/{harbor}/{date}'
PORT = int(os.environ.get('PORT', 3000))


def fetch_camellia(params):
    """2-step 세션 : POST 로 세션 쿠키 수립 후 GET 으로 실제 가격 HTML 수신.

    params 는 쿼리에서 받아온 dict (모두 문자열).
    필수 : oufuku(1편도/2왕복), ow, ow_date, rt, rt_date, number, process, harbor, date
    """
    jar = http.cookiejar.CookieJar()
    opener = build_opener(HTTPCookieProcessor(jar))
    opener.addheaders = [
        ('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) fare_optimizer_proxy'),
        ('Accept-Language', 'ko-KR,ko;q=0.9'),
        ('Accept', 'text/html,application/xhtml+xml'),
        ('Referer', CAMELLIA_BASE + '/'),
    ]
    # Step 1 : POST 세션 수립
    post_fields = {
        'oufuku': params.get('oufuku', '1'),
        'ow':     params.get('ow', '2'),
        'ow_date': params.get('ow_date', ''),
        'rt':     params.get('rt', '1'),
        'rt_date': params.get('rt_date', ''),
        'number': params.get('number', '1'),
    }
    post_body = urlencode(post_fields).encode('utf-8')
    post_req = Request(CAMELLIA_POST, data=post_body, method='POST')
    post_req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    opener.open(post_req, timeout=20).read()
    # Step 2 : GET plan HTML
    plan_url = CAMELLIA_PLAN_FMT.format(
        process=params.get('process', '1'),
        harbor=params.get('harbor', '2'),
        date=params.get('date', params.get('ow_date', '')),
    )
    with opener.open(plan_url, timeout=20) as r:
        return r.read().decode('utf-8', errors='replace')


class ProxyHandler(SimpleHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/serpapi':
            # 전달받은 쿼리를 그대로 SerpApi 에 통과
            target = f'{SERPAPI_BASE}?{parsed.query}'
            try:
                req = Request(target, headers={'User-Agent': 'Mozilla/5.0 fare_optimizer_proxy'})
                with urlopen(req, timeout=30) as r:
                    status = r.status
                    data = r.read()
                    content_type = r.getheader('Content-Type', 'application/json')
                self.send_response(status)
                self.send_header('Content-Type', content_type)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(data)
            except HTTPError as e:
                # SerpApi 가 보낸 에러(401/429 등)를 그대로 전달
                body = e.read() if hasattr(e, 'read') else str(e).encode()
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(body)
            except URLError as e:
                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(f'{{"error":"Upstream failed: {e.reason}"}}'.encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(f'{{"error":"Proxy error: {e}"}}'.encode())
        elif parsed.path == '/camellia':
            qs = parse_qs(parsed.query)
            params = {k: v[0] for k, v in qs.items() if v}
            try:
                html = fetch_camellia(params)
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(html.encode('utf-8'))
            except HTTPError as e:
                body = e.read() if hasattr(e, 'read') else str(e).encode()
                self.send_response(e.code)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(body)
            except URLError as e:
                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(f'{{"error":"Camellia upstream failed: {e.reason}"}}'.encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(f'{{"error":"Camellia proxy error: {e}"}}'.encode())
        else:
            # 그 외는 정적 파일 서빙
            return super().do_GET()


def main():
    print(f'proxy_server.py : http://localhost:{PORT}')
    print(f'  /serpapi?...    → {SERPAPI_BASE}?...')
    print(f'  /camellia?...   → {CAMELLIA_BASE}/rs/idv/reservation/* (2-step)')
    print(f'  정적 파일        → ./ (현재 디렉토리)')
    print(f'  Ctrl+C 로 종료')
    try:
        HTTPServer(('', PORT), ProxyHandler).serve_forever()
    except KeyboardInterrupt:
        print('\n종료')
        sys.exit(0)


if __name__ == '__main__':
    main()
