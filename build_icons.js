#!/usr/bin/env node
/*
 * icons.js 생성기 — Lucide 아이콘 세트에서 이 앱이 쓰는 것만 뽑아 로컬 파일로 만든다.
 *
 * 왜 CDN에서 직접 안 불러오나:
 *   Lucide UMD 전체는 gzip 100KB인데 우리가 쓰는 건 20개 남짓이다. 지도 마커는 화면에
 *   뜨자마자 그려져야 해서 비동기 로드는 아이콘이 늦게 붙는 문제가 생기고, 로딩 성능도
 *   이미 여러 번 손본 참이라 100KB를 더 얹지 않았다. 대신 아이콘 데이터만 추출해 둔다.
 *
 * 아이콘을 추가하려면 아래 NEEDED에 이름을 넣고 다시 실행:
 *   npm i --no-save lucide && node build_icons.js
 *
 * Lucide는 ISC 라이선스 (https://lucide.dev) — 아이콘 경로 데이터에 그대로 적용된다.
 */
const fs = require('fs');
const path = require('path');

// 앱에서 쓰는 아이콘 — 왼쪽이 우리가 부르는 이름, 오른쪽이 Lucide export 이름
const NEEDED = {
  anchor:    'Anchor',        // 항구 POI
  ship:      'Ship',          // 선박·시뮬레이션
  hotel:     'Hotel',         // 제휴 호텔
  bus:       'Bus',           // 순환버스 정류장
  car:       'Car',           // 렌터카
  plane:     'Plane',         // 공항
  mapPin:    'MapPin',        // 위치 일반
  bookOpen:  'BookOpen',      // 범례
  calendar:  'CalendarClock', // 선박·선석 스케줄
  help:      'CircleHelp',    // 사용법 가이드
  star:      'Star',          // ★기준일
  diamond:   'Diamond',       // ◆최적일
  pencil:    'Pencil',        // 보정
  warn:      'TriangleAlert', // 경고
  ruler:     'Ruler',         // 거리
  clock:     'Clock',         // 시각
  play:      'Play',
  pause:     'Pause',
  skipBack:  'SkipBack',
  skipFwd:   'SkipForward',
  repeat:    'Repeat',
  close:     'X',
  minimize:  'Minus'
};

function load() {
  const tries = [
    () => require('lucide'),
    () => require(path.join(process.env.TEMP || '/tmp', 'lucide.js'))
  ];
  for (const t of tries) { try { return t(); } catch (e) {} }
  console.error('lucide를 찾을 수 없습니다. `npm i --no-save lucide` 후 다시 실행하세요.');
  process.exit(1);
}

const L = load();
const out = {};
let missing = 0;
for (const [key, name] of Object.entries(NEEDED)) {
  const data = L[name];
  if (!data) { console.error('  없는 아이콘: ' + name); missing++; continue; }
  out[key] = data;
}
if (missing) process.exit(1);

const body = `// 이 파일은 build_icons.js가 만든 것입니다 — 직접 고치지 마세요.
// Lucide (https://lucide.dev, ISC 라이선스) 아이콘 중 이 앱이 쓰는 것만 담았습니다.
// 아이콘을 추가하려면 build_icons.js의 NEEDED에 넣고 다시 실행하세요.
const LUCIDE_ICONS = ${JSON.stringify(out)};

// 아이콘 하나를 SVG 문자열로 만든다.
//   name  LUCIDE_ICONS의 키
//   opt   { size, color, width(선 굵기), cls, style }
function icon(name, opt) {
  const o = opt || {};
  const data = LUCIDE_ICONS[name];
  if (!data) return '';
  const size = o.size || 16;
  const body = data.map(([tag, attrs]) => {
    const a = Object.entries(attrs).map(([k, v]) => k + '="' + v + '"').join(' ');
    return '<' + tag + ' ' + a + '/>';
  }).join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '"' +
    ' viewBox="0 0 24 24" fill="none" stroke="' + (o.color || 'currentColor') + '"' +
    ' stroke-width="' + (o.width || 2) + '" stroke-linecap="round" stroke-linejoin="round"' +
    (o.cls ? ' class="' + o.cls + '"' : '') +
    (o.style ? ' style="' + o.style + '"' : '') +
    ' aria-hidden="true">' + body + '</svg>';
}
`;

fs.writeFileSync(path.join(__dirname, 'icons.js'), body);
const kb = (fs.statSync(path.join(__dirname, 'icons.js')).size / 1024).toFixed(1);
console.log('icons.js 생성 — 아이콘 ' + Object.keys(out).length + '개, ' + kb + 'KB');
