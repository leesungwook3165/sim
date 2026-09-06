# DB 구조와 쿼리 (PostGIS 기준)

지금은 CSV를 브라우저에서 통째로 읽고 워커에서 분석한다. 배 한 척이 30만 행이라
한 척만 메모리에 두고, 배를 바꿀 때마다 다시 읽는다. 데이터가 더 늘거나 여러 사람이
같이 쓰게 되면 DB로 옮겨야 한다. 이 문서는 그때를 위한 설계다.

지금 코드의 어느 값이 어느 컬럼이 되는지 짝지어 두었으므로, 옮길 때 이 문서와
`index.html`을 나란히 놓고 보면 된다.

---

## 왜 PostGIS인가

지금 자바스크립트로 하는 일 중 상당수가 공간 연산이다.

| 지금 코드 | PostGIS |
|---|---|
| `_simDist` (하버사인) | `ST_Distance(geography, geography)` |
| `_aisSegCrossesLand` (200m 간격 표본) | `ST_Intersects(line, land_polygon)` |
| `_aisFindCalls` (항구 3km 안 + 3kt 이하) | `ST_DWithin(pt, port, 3000)` |
| `_aisTerminalAt` (버퍼 안에 있나) | `ST_DWithin` |
| 화면 밖 항적 솎기 | `ST_Simplify` + `&&` (bbox) |

특히 **육지 관통 판정**이 크게 달라진다. 지금은 쓰시마만 담은 2.4KB 격자 마스크라
해안에서 400m 이상 떨어진 곳은 바다로 읽히는데, PostGIS라면 실제 해안선 폴리곤을
그대로 넣고 `ST_Intersects`로 정확히 판정할 수 있다.

---

## 테이블

### `vessel` — 선박 등록부

지금 `_AIS_VESSELS`에 해당한다.

```sql
CREATE TABLE vessel (
  id          text PRIMARY KEY,          -- 'camellia', 'queenbeetle' …
  label       text NOT NULL,             -- '카멜리아호'
  operator    text,                      -- '카멜리아라인'  (지금 sub)
  color       text,                      -- '#ff66aa'
  mmsi        bigint,                    -- AIS 원본에 있으나 지금은 안 쓴다
  cruise_kts  real,                      -- 분석으로 산출 (_aisCruiseSpeed)
  created_at  timestamptz DEFAULT now()
);
```

### `port` — 항구

지금 `ports` 배열. `geog`를 함께 두는 이유는 거리 계산이 전부 미터 단위라서다.

```sql
CREATE TABLE port (
  id      text PRIMARY KEY,              -- 'busan', 'hakata', 'jindo' …
  name    text NOT NULL,                 -- '부산항 국제여객터미널'
  role    text,                          -- '출발지' / '경유지 (구상)' / '참고 (국내 항로)'
  geog    geography(Point, 4326) NOT NULL,
  tags    text[],
  descr   text
);
CREATE INDEX port_geog_idx ON port USING GIST (geog);
```

좌표는 **실제 접안한 저속 지점의 중앙값**을 쓴다. 자동 검출한 군집 중심을 쓰면
1km 안팎 밀려서 항구 이름까지 잘못 붙는다(진도항을 서망항으로 적었던 일).

### `ais_ping` — 원본 항적 (가장 큰 표)

CSV 한 줄이 한 행. 9척 합쳐 약 91만 행.

```sql
CREATE TABLE ais_ping (
  vessel_id text NOT NULL REFERENCES vessel(id),
  ts        timestamptz NOT NULL,        -- CSV의 timestamp (UTC)
  geog      geography(Point, 4326) NOT NULL,
  speed     real,                        -- knot
  course    real,                        -- 도(0~360). 빈 값인 배가 있다(쓰시마링크)
  depth     real,
  seg_id    text,                        -- GFW가 준 항적 조각 id
  PRIMARY KEY (vessel_id, ts)
);

-- 시간 범위로 자르는 조회가 대부분이라 시간 순으로 클러스터링해 두면 좋다
CREATE INDEX ais_ping_vessel_ts ON ais_ping (vessel_id, ts);
CREATE INDEX ais_ping_geog_idx  ON ais_ping USING GIST (geog);
```

> **분할(파티션)** — 91만 행은 파티션 없이도 충분하지만, 배가 늘거나 실시간 수집을
> 시작하면 `PARTITION BY RANGE (ts)`로 월 단위로 나누는 게 낫다. 조회가 거의 항상
> "이 배의 이 기간"이라 파티션 가지치기가 잘 듣는다.

원본은 절대 고치지 않는다. 보정은 아래 별도 표에 쌓는다.

### `voyage` — 항차 (분석 결과)

핵심 표. **"하루"가 아니라 "항구 정박과 정박 사이"**가 단위다. 이렇게 해야 하루에
여러 번 왕복하는 배(비틀호), 하루에 편도만 하는 배(성희·하마유), 한 항차가 이틀에
걸치는 배(미라클)를 모두 같은 방식으로 다룰 수 있다.

```sql
CREATE TABLE voyage (
  id             bigserial PRIMARY KEY,
  vessel_id      text NOT NULL REFERENCES vessel(id),
  depart_ts      timestamptz NOT NULL,   -- 출발항 정박이 끝난 시각
  arrive_ts      timestamptz NOT NULL,   -- 도착항 정박이 시작된 시각
  from_port_id   text REFERENCES port(id),
  to_port_id     text REFERENCES port(id),
  raw_km         double precision,       -- 원본 직선 합
  corr_km        double precision,       -- 보정 반영 (없으면 raw와 같다)
  duration_min   double precision GENERATED ALWAYS AS
                   (EXTRACT(epoch FROM arrive_ts - depart_ts) / 60) STORED,
  avg_kts        real,
  -- 시각을 얼마나 믿을 수 있나 = 그 순간을 감싸는 핑 간격(분)
  depart_gap_min double precision,
  arrive_gap_min double precision,
  ramps_up       smallint,               -- 출항 가속 횟수
  ramps_down     smallint,               -- 입항 감속 횟수
  time_ratio     double precision,       -- 실제 소요 ÷ 이론 소요(거리÷순항속도)
  is_ref         boolean,                -- ★기준 항차
  track          geography(LineString, 4326),  -- 그리기용. 원본에서 만들 수 있어 없어도 된다
  UNIQUE (vessel_id, depart_ts)
);
CREATE INDEX voyage_vessel_depart ON voyage (vessel_id, depart_ts);
CREATE INDEX voyage_route ON voyage (vessel_id, from_port_id, to_port_id);
```

`depart_gap_min` / `arrive_gap_min`이 중요하다. AIS는 일정 간격으로 오지 않는다.
배가 움직이면 핑이 촘촘해져 **출항 시각은 정확**하지만(퀸비틀 중앙 2분), 접안하면
간격이 70분대로 벌어져 **도착 시각은 그만큼 뒤로 밀릴 수 있다**(중앙 71분).
AIS가 며칠 끊긴 구간은 수천 분이라 그 항차의 시각은 아예 의미가 없다.

### `port_call` — 기항

항차의 양 끝과 경유(추자도·히타카츠)를 모두 담는다.

```sql
CREATE TABLE port_call (
  id         bigserial PRIMARY KEY,
  vessel_id  text NOT NULL REFERENCES vessel(id),
  port_id    text NOT NULL REFERENCES port(id),
  arrive_ts  timestamptz NOT NULL,
  depart_ts  timestamptz NOT NULL,
  dwell_min  double precision GENERATED ALWAYS AS
               (EXTRACT(epoch FROM depart_ts - arrive_ts) / 60) STORED,
  min_dist_m double precision,           -- 그 항구에 얼마나 붙었나
  UNIQUE (vessel_id, port_id, arrive_ts)
);
CREATE INDEX port_call_vessel_ts ON port_call (vessel_id, arrive_ts);
```

기항 판정은 **"항구 3km 안 + 3kt 이하"**다. "2kt 이하 8분 지속"으로 잡으면 잠깐
들르는 경유를 놓친다 — 추자도는 0.6~0.8km까지 붙고 최저 0.8kt로 서는데도 안 잡혔고,
울릉도는 47일 중 2회만 잡혔다.

### `track_correction` — 손으로 고친 항로

원본을 안 건드리는 대신 여기 쌓는다. 지금 localStorage(`hanjil_ais_corrections`).

```sql
CREATE TABLE track_correction (
  id         bigserial PRIMARY KEY,
  vessel_id  text NOT NULL REFERENCES vessel(id),
  from_ts    timestamptz NOT NULL,       -- 원본 구간의 시작 핑 (구간 번호가 아니라 시각으로 잡는다)
  to_ts      timestamptz NOT NULL,
  path       geography(LineString, 4326) NOT NULL,
  raw_km     double precision,
  corr_km    double precision,
  route_name text,                       -- '직접 당겨서 보정 (꼭짓점 3개)'
  author     text,
  saved_at   timestamptz DEFAULT now(),
  UNIQUE (vessel_id, from_ts)
);
```

키를 **구간 번호가 아니라 시각**으로 잡는 게 중요하다. 하루 전체·출항편·시간 단위로
보는 화면마다 배열이 잘려 번호가 달라진다.

### `best_day` — 사람이 고른 최적일

규칙으로 뽑는 ★기준일과 별개로, 눈으로 봐서 가장 깔끔한 날.

```sql
CREATE TABLE best_day (
  vessel_id text NOT NULL REFERENCES vessel(id),
  day       date NOT NULL,
  note      text,
  author    text,
  PRIMARY KEY (vessel_id, day)
);
```

### `land` — 육지·해안선

육지 관통 판정용. 지금은 쓰시마만 담은 격자 마스크라 한계가 있다.

```sql
CREATE TABLE land (
  id     bigserial PRIMARY KEY,
  source text,                           -- 'ne_10m_land', 'kr_coastline', 'jp_n03'
  geom   geometry(MultiPolygon, 4326) NOT NULL
);
CREATE INDEX land_geom_idx ON land USING GIST (geom);
```

---

## 쿼리

### 1. 항차 만들기 — 정박과 정박 사이로 자르기

지금 `_aisFindCalls` + `_aisBuildVoyages`가 하는 일. 창 함수로 한 번에 된다.

```sql
-- ① 항구에 붙어 있던 핑에 표시를 남긴다 (3km 안 + 3kt 이하)
WITH tagged AS (
  SELECT p.vessel_id, p.ts, p.geog, p.speed,
         (SELECT c.id FROM port c
           WHERE ST_DWithin(p.geog, c.geog, 3000)
           ORDER BY p.geog <-> c.geog LIMIT 1) AS at_port
  FROM ais_ping p
  WHERE p.vessel_id = $1
),
-- ② 항구가 바뀌는 지점마다 묶음 번호를 올린다
grp AS (
  SELECT *, SUM(CASE WHEN at_port IS DISTINCT FROM lag_port THEN 1 ELSE 0 END)
              OVER (ORDER BY ts) AS grp_id
  FROM (SELECT *, LAG(at_port) OVER (ORDER BY ts) AS lag_port FROM tagged) t
),
-- ③ 항구에 머문 묶음만 남기면 그것이 기항이다
calls AS (
  SELECT vessel_id, at_port AS port_id,
         MIN(ts) AS arrive_ts, MAX(ts) AS depart_ts
  FROM grp
  WHERE at_port IS NOT NULL AND speed <= 3
  GROUP BY vessel_id, at_port, grp_id
)
-- ④ 이웃한 기항 두 개가 한 항차
SELECT c.vessel_id,
       c.depart_ts,
       LEAD(c.arrive_ts)  OVER w AS arrive_ts,
       c.port_id          AS from_port_id,
       LEAD(c.port_id)    OVER w AS to_port_id
FROM calls c
WINDOW w AS (PARTITION BY c.vessel_id ORDER BY c.arrive_ts);
```

### 2. 항차의 거리와 항적

```sql
SELECT v.id,
       ST_Length(ST_MakeLine(p.geog::geometry ORDER BY p.ts)::geography) / 1000 AS km,
       ST_MakeLine(p.geog::geometry ORDER BY p.ts)::geography                   AS track
FROM voyage v
JOIN ais_ping p
  ON p.vessel_id = v.vessel_id
 AND p.ts BETWEEN v.depart_ts AND v.arrive_ts
WHERE v.id = $1
GROUP BY v.id;
```

### 3. 시각의 오차 폭 — 그 순간을 감싸는 핑 간격

```sql
-- 출항: 그 핑 다음 핑까지가 실제 출항이 있을 수 있는 구간
SELECT v.id,
       EXTRACT(epoch FROM (
         SELECT MIN(p.ts) FROM ais_ping p
          WHERE p.vessel_id = v.vessel_id AND p.ts > v.depart_ts
       ) - v.depart_ts) / 60 AS depart_gap_min,
       EXTRACT(epoch FROM v.arrive_ts - (
         SELECT MAX(p.ts) FROM ais_ping p
          WHERE p.vessel_id = v.vessel_id AND p.ts < v.arrive_ts
       )) / 60 AS arrive_gap_min
FROM voyage v;
```

### 4. 공식 시간표 복원 — 믿을 수 있는 항차만 모아서

지금 이 방식으로 카멜리아 22:00(78%), 성희호 21:00(85%)가 나왔고 공식과 맞았다.

```sql
SELECT from_port_id, to_port_id,
       date_trunc('hour', depart_ts AT TIME ZONE 'Asia/Seoul')
         + INTERVAL '30 min' * FLOOR(EXTRACT(minute FROM depart_ts AT TIME ZONE 'Asia/Seoul') / 30)
         AS slot,
       COUNT(*) AS n,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY from_port_id, to_port_id), 0) AS pct
FROM voyage
WHERE vessel_id = $1
  AND depart_gap_min <= 20          -- 출항 시각을 믿을 수 있는 항차만
GROUP BY from_port_id, to_port_id, slot
ORDER BY from_port_id, to_port_id, n DESC;
```

### 5. ★기준 항차 고르기

```sql
WITH main AS (   -- 가장 잦은 항로 (출발항 ≠ 도착항)
  SELECT from_port_id, to_port_id
  FROM voyage WHERE vessel_id = $1 AND from_port_id <> to_port_id
  GROUP BY 1, 2 ORDER BY COUNT(*) DESC LIMIT 1
),
cand AS (
  SELECT v.* FROM voyage v, main m
  WHERE v.vessel_id = $1
    AND ((v.from_port_id, v.to_port_id) IN ((m.from_port_id, m.to_port_id),
                                            (m.to_port_id, m.from_port_id)))
    AND v.ramps_up >= 1 AND v.ramps_down >= 1
    AND v.depart_gap_min <= 20 AND v.arrive_gap_min <= 90
),
base AS (        -- 깨끗한 배율 = 하위 10% 분위수
  SELECT percentile_cont(0.10) WITHIN GROUP (ORDER BY time_ratio) AS r FROM cand
)
SELECT c.* FROM cand c, base b
WHERE c.time_ratio BETWEEN b.r * 0.85 AND b.r * 1.20;
```

오염(정박이 시간에 섞임, AIS 공백)은 시간을 **늘리기만** 하므로 중앙값이 아니라
하위 분위수를 기준으로 삼는다.

### 6. 육지를 지나는 구간 찾기

지금은 200m 간격 표본으로 세지만, 폴리곤이 있으면 한 번에 판정된다.

```sql
WITH seg AS (
  SELECT vessel_id, ts AS from_ts,
         LEAD(ts)   OVER w AS to_ts,
         ST_MakeLine(geog::geometry, LEAD(geog::geometry) OVER w) AS line
  FROM ais_ping WHERE vessel_id = $1
  WINDOW w AS (ORDER BY ts)
)
SELECT s.from_ts, s.to_ts,
       ST_Length(ST_Intersection(s.line, l.geom)::geography) / 1000 AS land_km
FROM seg s JOIN land l ON ST_Intersects(s.line, l.geom)
WHERE s.to_ts IS NOT NULL
  -- 이미 손으로 고쳐 둔 구간은 뺀다
  AND NOT EXISTS (SELECT 1 FROM track_correction c
                   WHERE c.vessel_id = s.vessel_id AND c.from_ts = s.from_ts)
ORDER BY land_km DESC;
```

### 7. 보정을 반영한 항적 (원본은 그대로)

```sql
SELECT COALESCE(c.path, ST_MakeLine(...)::geography) AS path
FROM seg s
LEFT JOIN track_correction c
       ON c.vessel_id = s.vessel_id AND c.from_ts = s.from_ts;
```

### 8. 화면에 그릴 항적 — 줌에 맞춰 솎기

전체 기간을 그릴 때 26만 점을 다 보내면 과하다. 화면 밖은 자르고 픽셀 크기에 맞춰
단순화한다. `ST_Simplify`는 **모양 기준**이라 "N개마다 하나"와 달리 오차 상한이 있다
(그 방식은 항로를 중앙 5.77km, 최악 12.43km 어긋나게 했다).

```sql
SELECT v.id,
       ST_AsGeoJSON(
         ST_Simplify(ST_Intersection(v.track::geometry, ST_MakeEnvelope($2,$3,$4,$5,4326)),
                     $6)   -- 허용오차(도). 줌에 따라 1픽셀에 해당하는 값을 넣는다
       ) AS geojson
FROM voyage v
WHERE v.vessel_id = $1
  AND v.track::geometry && ST_MakeEnvelope($2,$3,$4,$5,4326);
```

---

## 옮길 때 순서

1. `port`·`vessel`을 먼저 채운다 (지금 코드의 배열을 그대로 옮기면 된다)
2. `ais_ping`을 `COPY`로 적재 — CSV 헤더가 `lon,lat,course,timestamp,speed,depth,seg_id`라
   컬럼 순서만 맞추면 바로 들어간다
3. `land`에 해안선을 넣는다 (Natural Earth 10m이면 한·일 동시 커버)
4. 쿼리 1로 `port_call` → `voyage`를 만든다
5. 쿼리 3으로 오차 폭을, 5로 ★기준 항차를 채운다
6. 브라우저는 `voyage`와 솎아낸 항적만 받아 그린다 — 30만 행을 통째로 읽던 지금 방식이
   사라지므로 메모리 문제(한 척 110MB)도 함께 없어진다

## 남는 문제

- **시각 오차** — DB로 옮겨도 AIS 핑 간격은 그대로다. `depart_gap_min`·`arrive_gap_min`을
  꼭 함께 보여줘야 한다. 도착 시각은 중앙 70분대 오차가 있다.
- **경유 유무** — 산타모니카는 추자도를 들를 때도 있고 안 들를 때도 있어 편도거리가
  두 갈래다. `port_call`에 추자도가 있는지로 갈라야 한다.
- **하루 여러 왕복** — 비틀호는 출항 시각이 08:00·07:30·15:30으로 흩어져 시간표가
  하나로 안 모인다. 항로별이 아니라 "항차 순번"까지 봐야 할 수 있다.
