"""
미라클투어 관광버스 노선 — OSRM 자동차(driving) 기준 라우팅
각 정류장 구간을 OSRM 공개 API로 연결 → miracle_bus_route.geojson + bus_route_embed.js 저장
"""
import json, math, urllib.request, time, sys
sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_PATH = r"c:\Users\user\Desktop\my\miracle_bus_route.geojson"
OUTPUT_JS   = r"c:\Users\user\Desktop\my\bus_route_embed.js"

# (lat, lng) 순서
BUS_STOPS = [
    (34.655985, 129.469543),               # 히타카츠 국제터미널
    (34.667303, 129.484391),               # 미우다 해변
    (34.694405619993354, 129.44194746555985),  # 한국 전망대
    (34.67182178510698,  129.43416011396272),  # 밸류마트 오오우라
    (34.297960781147005, 129.35583136743313),  # 만제키 다리
    (34.20358739838709,  129.28597398752063),  # 조선통신사 역사관
    (34.268874818717144, 129.31496331505713),  # 스미요시 신사
    (34.37191890174181,  129.31437725692416),  # 에보시다케 전망대
    (34.27310031304589,  129.31920490290148),  # 밸류마트 (사이키)
]

OSRM = "http://router.project-osrm.org/route/v1/driving"

def osrm_route(a, b):
    lat1, lng1 = a
    lat2, lng2 = b
    url = f"{OSRM}/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.load(r)
        if data.get("code") != "Ok":
            print(f"    OSRM error code: {data.get('code')}")
            return None
        coords = data["routes"][0]["geometry"]["coordinates"]  # [[lng,lat],...]
        print(f"    OK — {len(coords)} pts")
        return coords
    except Exception as e:
        print(f"    OSRM request failed: {e}")
        return None

all_coords = []
for i in range(len(BUS_STOPS) - 1):
    a, b = BUS_STOPS[i], BUS_STOPS[i+1]
    print(f"Segment {i+1}/{len(BUS_STOPS)-1}: ({a[0]:.4f},{a[1]:.4f}) → ({b[0]:.4f},{b[1]:.4f})")
    seg = osrm_route(a, b)
    if seg is None:
        print("    fallback: straight line")
        seg = [[a[1], a[0]], [b[1], b[0]]]
    if i > 0 and seg:
        seg = seg[1:]  # 중복 연결점 제거
    all_coords.extend(seg)
    time.sleep(0.4)  # API 남용 방지

# 소수점 6자리 반올림
all_coords = [[round(c[0], 6), round(c[1], 6)] for c in all_coords]

# ─── GeoJSON 저장 ───
out = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "properties": {"name": "미라클투어 관광버스 노선"},
        "geometry": {"type": "LineString", "coordinates": all_coords}
    }]
}
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)

# ─── 브라우저 embed JS 저장 ───
js_body = json.dumps(all_coords, separators=(",", ":"))
with open(OUTPUT_JS, "w", encoding="utf-8") as f:
    f.write(f"const _BUS_ROUTE_COORDS={js_body};")

R = 111194
def lm(lat): return R * math.cos(math.radians(lat))
total_m = sum(
    math.sqrt(((all_coords[i+1][1]-all_coords[i][1])*R)**2 +
              ((all_coords[i+1][0]-all_coords[i][0])*lm(all_coords[i][1]))**2)
    for i in range(len(all_coords)-1)
)
print(f"\n완료 — {len(all_coords)} 좌표, 총 {total_m/1000:.1f}km")
print(f"저장: {OUTPUT_PATH}")
print(f"저장: {OUTPUT_JS}")
