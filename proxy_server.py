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

의존성: Python 표준 라이브러리만 — pip install 없음.
포트: 3000 (환경변수 PORT 로 변경 가능)
"""

import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


SERPAPI_BASE = 'https://serpapi.com/search.json'
PORT = int(os.environ.get('PORT', 3000))


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
        else:
            # 그 외는 정적 파일 서빙
            return super().do_GET()


def main():
    print(f'proxy_server.py : http://localhost:{PORT}')
    print(f'  /serpapi?...    → {SERPAPI_BASE}?...')
    print(f'  정적 파일        → ./ (현재 디렉토리)')
    print(f'  Ctrl+C 로 종료')
    try:
        HTTPServer(('', PORT), ProxyHandler).serve_forever()
    except KeyboardInterrupt:
        print('\n종료')
        sys.exit(0)


if __name__ == '__main__':
    main()
