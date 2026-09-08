"""
부산(PUS) → 후쿠오카(FUK) 항공운임 수집 스크립트
GitHub Actions에서 실행 — MYREALTRIP_API_KEY 환경변수 필요
결과를 data/airfare.json 으로 저장

API: https://partner-ext-api.myrealtrip.com
     POST /v1/products/flight/calendar/window
     (최대 180일 왕복 캘린더 가격 일괄 반환)
"""

import os, json, datetime, requests

API_KEY  = os.environ.get("MYREALTRIP_API_KEY", "")
BASE_URL = "https://partner-ext-api.myrealtrip.com"
ORIGIN   = "PUS"
DEST     = "FUK"
PERIOD   = 3  # 체류 기간(일) — 왕복 운임 산출 기준

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept":        "application/json",
    "Content-Type":  "application/json",
    "User-Agent":    "Mozilla/5.0 (compatible; GitHubActions)",
}

BODY = {
    "depCityCd": ORIGIN,
    "arrCityCd": DEST,
    "period":    PERIOD,
}

endpoint = f"{BASE_URL}/v1/products/flight/calendar/window"
print(f"POST {endpoint}")
print(f"  body: {json.dumps(BODY)}")

data_items = []
error_msg  = None

try:
    r = requests.post(endpoint, headers=HEADERS, json=BODY, timeout=30)
    print(f"  → HTTP {r.status_code}")
    if not r.ok:
        print(f"  오류: {r.text[:500]}")
        error_msg = r.text[:500]
    else:
        resp = r.json()
        data_items = resp.get("data", [])
        print(f"  수신 {len(data_items)}건")
        if not data_items:
            print(f"  응답 미리보기: {json.dumps(resp)[:300]}")
except Exception as e:
    print(f"  예외: {e}")
    error_msg = str(e)

output = {
    "updatedAt":   datetime.datetime.utcnow().isoformat() + "Z",
    "origin":      ORIGIN,
    "destination": DEST,
    "period":      PERIOD,
    "error":       error_msg,
    "results":     data_items,
}

os.makedirs("data", exist_ok=True)
with open("data/airfare.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\nSaved data/airfare.json — {len(data_items)}건")
