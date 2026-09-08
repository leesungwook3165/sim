"""
부산(PUS) → 후쿠오카(FUK) 항공운임 수집 스크립트
GitHub Actions에서 실행 — MYREALTRIP_API_KEY 환경변수 필요
결과를 data/airfare.json 으로 저장
"""

import os, json, sys, datetime, requests

API_KEY = os.environ.get("MYREALTRIP_API_KEY", "")
ORIGIN  = "PUS"
DEST    = "FUK"
ADULTS  = 1

# 오늘 기준 7~21일 후 날짜를 수집 대상으로 삼는다
today    = datetime.date.today()
dep_dates = [(today + datetime.timedelta(days=d)).strftime("%Y-%m-%d") for d in range(7, 22)]

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "X-API-Key":     API_KEY,
    "Accept":        "application/json",
    "Content-Type":  "application/json",
    "User-Agent":    "Mozilla/5.0 (compatible; GitHubActions)",
}

# 시도할 엔드포인트 패턴 (v3 우선)
ENDPOINTS = [
    "https://api.myrealtrip.com/v3/flights",
    "https://api.myrealtrip.com/v3/flights/search",
    "https://partner.myrealtrip.com/v3/flights",
    "https://api.myrealtrip.com/v3/flights/offers",
]

def try_get(date_str):
    params = {
        "departure": ORIGIN, "arrival": DEST,
        "departureDate": date_str, "adults": ADULTS,
        "cabinClass": "ECONOMY", "currency": "KRW", "locale": "ko",
    }
    for base in ENDPOINTS:
        try:
            r = requests.get(base, headers=HEADERS, params=params, timeout=15)
            if r.ok:
                print(f"  {date_str} → {base} OK ({r.status_code})")
                return {"endpoint": base, "status": r.status_code, "data": r.json()}
            # 인증 실패(401/403) → 다른 엔드포인트도 같은 결과이므로 중단
            if r.status_code in (401, 403):
                print(f"  {date_str} → {base} AUTH ERROR {r.status_code}: {r.text[:200]}")
                return {"endpoint": base, "status": r.status_code, "error": r.text[:500]}
        except Exception as e:
            print(f"  {date_str} → {base} ERR: {e}")
            continue
    return {"endpoint": None, "status": 0, "error": "all endpoints failed"}

def try_post(date_str):
    body = {
        "origin": ORIGIN, "destination": DEST,
        "departureDate": date_str,
        "passengers": {"adults": ADULTS, "children": 0},
        "cabinClass": "ECONOMY", "currency": "KRW",
    }
    url = "https://api.myrealtrip.com/v3/flights/search"
    try:
        r = requests.post(url, headers=HEADERS, json=body, timeout=15)
        if r.ok:
            print(f"  {date_str} → POST {url} OK ({r.status_code})")
            return {"endpoint": url, "method": "POST", "status": r.status_code, "data": r.json()}
        return {"endpoint": url, "method": "POST", "status": r.status_code, "error": r.text[:500]}
    except Exception as e:
        return {"endpoint": url, "method": "POST", "status": 0, "error": str(e)}

# ── 수집 실행 ──
results = []
for d in dep_dates:
    print(f"Fetching {d}...")
    res = try_get(d)
    if res["status"] == 0 or res["status"] in (404, 422):
        # GET 실패 시 POST 시도
        res = try_post(d)
    results.append({"date": d, **res})

output = {
    "updatedAt": datetime.datetime.utcnow().isoformat() + "Z",
    "origin":    ORIGIN,
    "destination": DEST,
    "results":   results,
}

os.makedirs("data", exist_ok=True)
with open("data/airfare.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\nSaved data/airfare.json — {len(results)} dates")

# 모든 결과가 에러면 exit code 0으로도 저장은 했으므로 정상 종료
# (에러 JSON도 디버깅용으로 커밋하기 위해 non-zero exit 안 씀)
