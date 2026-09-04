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

def first_number(text: str) -> float | None:
    m = re.search(r"[\d,]+\.?\d*", text.replace(",", ""))
    return float(m.group()) if m else None


def scrape() -> dict:
    r = requests.get(URL, headers=HEADERS, timeout=20)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "lxml")

    prices = {}
    # 페이지 내 모든 <th>/<td> 텍스트로 유종 헤더를 찾고 같은 행의 다음 셀에서 가격 추출
    for tag in ("VLSFO", "LSMGO"):
        found = soup.find(string=re.compile(tag, re.I))
        if not found:
            continue
        # 헤더가 포함된 테이블에서 첫 번째 데이터 행의 가격(두 번째 컬럼) 추출
        tbl = found.find_parent("table")
        if not tbl:
            continue
        rows = tbl.find_all("tr")
        for row in rows:
            cells = row.find_all(["td", "th"])
            if len(cells) >= 2:
                price_text = cells[1].get_text(strip=True)
                val = first_number(price_text)
                if val and val > 100:   # 의미있는 가격값만
                    prices[tag.lower()] = val
                    break

    # 날짜: 페이지 내 yyyy-mm-dd 형식 첫 번째 매칭
    date_m = re.search(r"\d{4}-\d{2}-\d{2}", r.text)
    price_date = date_m.group() if date_m else None

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
