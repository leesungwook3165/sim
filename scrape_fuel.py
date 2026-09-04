"""
Bunker Index 부산항 VLSFO·LSMGO 단가 스크레이퍼
실행 결과: fuel_price.json 생성/갱신
"""
import json, re, sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("pip install requests beautifulsoup4 lxml", file=sys.stderr)
    sys.exit(1)

URL = "https://www.bunkerindex.com/prices/port.php?p=109&n=busan-republic-of-korea"
OUT = Path(__file__).with_name("fuel_price.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
}


def scrape() -> dict:
    r = requests.get(URL, headers=HEADERS, timeout=20)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "lxml")

    prices = {}
    price_date = None

    # 페이지 내 <script> 태그에 let data=[...]; let productName='VLSFO'; 형태로 데이터가 삽입됨
    for script in soup.find_all("script"):
        text = script.string or ""
        # productName 추출
        name_m = re.search(r"let\s+productName\s*=\s*'([^']+)'", text)
        if not name_m:
            continue
        product = name_m.group(1).upper()
        if product not in ("VLSFO", "LSMGO"):
            continue

        # data 배열 추출
        data_m = re.search(r"let\s+data\s*=\s*(\[.*?\]);", text, re.S)
        if not data_m:
            continue
        records = json.loads(data_m.group(1))
        if not records:
            continue

        # 마지막 항목 = 최신 날짜
        latest = records[-1]
        val = float(latest["price"])
        if val > 0:
            prices[product.lower()] = val
            if price_date is None:
                price_date = latest["date"]

    if not prices:
        raise RuntimeError("가격 파싱 실패 — 페이지 구조가 변경되었을 수 있습니다.")

    kst = timezone(timedelta(hours=9))
    return {
        "fetched_at": datetime.now(kst).isoformat(timespec="seconds"),
        "price_date": price_date,
        "vlsfo_usd_per_mt": prices.get("vlsfo"),
        "lsmgo_usd_per_mt": prices.get("lsmgo"),
        "source_url": URL,
    }


if __name__ == "__main__":
    data = scrape()
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(data, ensure_ascii=False, indent=2))
