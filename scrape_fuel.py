"""
Bunker Index 부산항 VLSFO·LSMGO 단가 + USD/KRW 환율 스크레이퍼
실행 결과: fuel_price.json 생성/갱신 + index.html 기본값 패치
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
HERE = Path(__file__).parent
OUT  = HERE / "fuel_price.json"
HTML = HERE / "index.html"

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

    for script in soup.find_all("script"):
        text = script.string or ""
        name_m = re.search(r"let\s+productName\s*=\s*'([^']+)'", text)
        if not name_m:
            continue
        product = name_m.group(1).upper()
        if product not in ("VLSFO", "LSMGO"):
            continue
        data_m = re.search(r"let\s+data\s*=\s*(\[.*?\]);", text, re.S)
        if not data_m:
            continue
        records = json.loads(data_m.group(1))
        if not records:
            continue
        latest = records[-1]
        val = float(latest["price"])
        if val > 0:
            prices[product.lower()] = val
            if price_date is None:
                price_date = latest["date"]

    if not prices:
        raise RuntimeError("가격 파싱 실패 — 페이지 구조가 변경되었을 수 있습니다.")

    usd_krw = None
    fx_date = None
    try:
        fx = requests.get("https://api.frankfurter.app/latest?from=USD&to=KRW", timeout=10)
        fx.raise_for_status()
        fx_data = fx.json()
        usd_krw = fx_data["rates"]["KRW"]
        fx_date = fx_data.get("date")
    except Exception as e:
        print(f"환율 조회 실패(무시): {e}", file=sys.stderr)

    kst = timezone(timedelta(hours=9))
    return {
        "fetched_at": datetime.now(kst).isoformat(timespec="seconds"),
        "price_date": price_date,
        "vlsfo_usd_per_mt": prices.get("vlsfo"),
        "lsmgo_usd_per_mt": prices.get("lsmgo"),
        "usd_krw_rate": usd_krw,
        "fx_date": fx_date,
        "source_url": URL,
        "fx_source_url": "https://api.frankfurter.app",
    }


def patch_html(data: dict) -> bool:
    """index.html의 기본값을 최신 단가·환율로 패치 — 로컬 file:// 환경 대응"""
    if not HTML.exists():
        return False
    lsmgo = data.get("lsmgo_usd_per_mt")
    krw   = data.get("usd_krw_rate")
    if not lsmgo and not krw:
        return False

    html = HTML.read_text(encoding="utf-8")
    original = html

    if lsmgo:
        # inputLsmgoUsd 입력란 value 패치
        html = re.sub(
            r'(id="inputLsmgoUsd"[^>]*value=")[^"]*(")',
            lambda m: m.group(1) + str(lsmgo) + m.group(2),
            html,
        )
        # JS 변수 기본값 패치
        html = re.sub(
            r'(let fuelLsmgoUsdPerMt\s*=\s*)[\d.]+',
            lambda m: m.group(1) + str(lsmgo),
            html,
        )

    if krw:
        krw_rounded = round(krw)
        # inputKrwRate 입력란 value 패치
        html = re.sub(
            r'(id="inputKrwRate"[^>]*value=")[^"]*(")',
            lambda m: m.group(1) + str(krw_rounded) + m.group(2),
            html,
        )
        # JS 변수 기본값 패치
        html = re.sub(
            r'(let fuelUsdKrwRate\s*=\s*)[\d]+',
            lambda m: m.group(1) + str(krw_rounded),
            html,
        )

    if html != original:
        HTML.write_text(html, encoding="utf-8")
        print(f"index.html patch OK: LSMGO={lsmgo}, KRW={round(krw) if krw else 'unchanged'}")
        return True
    return False


if __name__ == "__main__":
    data = scrape()
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(data, ensure_ascii=False, indent=2))
    patch_html(data)
