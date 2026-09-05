// 쓰시마 육지 마스크 — 일본 국토수치정보 도로 데이터(N13-24_5129, 5.7MB)에서 생성.
// 도로가 지나는 격자를 육지로 잡고, 바다 쪽에서 채우기(flood fill)로 도로 없는 내륙까지 메웠다.
// AIS 구간이 이 격자를 지나면 "육지 관통"으로 보고 보정 대상으로 표시한다.
// 격자 0.003도(약 300m) · 201×121 · 육지 6804셀(도로 4898 + 내부 채움 1906)
// 저장은 런렝스(varint)+base64 — 비트맵 base64(4.0KB) 대비 1/4 크기이고 디코딩도 동기적이다.
const TSUSHIMA_LAND = { cell: 0.003, i0: 11362, j0: 43050, w: 121, h: 201, rle: "3AUCCgFtAggEBQIDAWEBBwUBAQEEAgJhAgEBAxFhGGIXYhhfGgECXxwCAVkgAgJUJFchWCFYIVggWCNWIlciViNXIQIBVCYBAVEpUiVUJlIlVSVVJlMlUyVUJlMlVChRKFEoUSlQKFImUycCAU8nAQJPK1AoUShQKQICTSxOKlEnUydSKE4rTipQKk4sTitOLE0rTitPKwsBQi8GAgEBQS8DB0AiAwoBCEAbAgEDAgMGAg0+GwQEBAUGCEAXAQIEBQYBCgo7FgMDAgURCzwGAwkFAgIFEAEBAgECAQECAzoHCAQEAwIGDQEBBAgDOAgQAgUBAQINAQIEQgMBBBcBAgIMAgIBAQFDAgMDEwQDAgwERQIEAhMDEgQBA0ACBAQQAwoBAgQFAgECRAcPAgwEAgIBAwEERAcOBAoFAwMDAkUCAQISAwwDCAVDAgEBIgIHCkABJgEHBgYCPAEuAgEEBQNuAwMFbwQCBW0OWQIBAQ0LAgJZBA0KAwNXAgECDQsCBEADAgICAQ8DCgwDAgECPxAJBAkKBgEBAj0BARAIBQkMBgI9BgELBgcIDkQFAwkHCAcOTgEBBwYIBQ5RAQEFBgcHDVQDCAUJCFoBCAYHCVkCCAcBAgIKWAMEAgMVWCEBAlQmUwEBHgIGVRoEBlQcWiBbIFgiVyJYIFkfWx1ZIFkgXB1eG10eWCBaAgEBAgIBFmABAhZiF2EYXwEEF1gCAwICGFcjViRWJlInUihSJ1ImVChUJVQkViVUKFIoUilQKU8qTytPLE4uTC1MBAInTAQCJk4BAwMBJVACAiZPAQYlUQEDJVABASdQKVAqTS1MLUsvSAEBMT0CBzM9AwQ1PgMCNjw8PT49PD47Pzo/Oj87QDhBOUE6PzhBOEE1RCsCAQQBRypQKgQBSioEAkkqAgMGA0EpAwQDBEICAS8BAkcyRzZCN0I3QjdDAgEkAQlHAwQIAQIEAgMMAgpGAwUHBgIEDAIMTgMOCQcKXgIBBwgIXgMBBgkLXwYHAwEGAQJbAgIBAgIGBAICAQICBFoCAQECAgUCBQICAQMEWgEBAQMBBQEKAQMB3wU=" };
(function () {
  const bin = atob(TSUSHIMA_LAND.rle);
  const grid = new Uint8Array(TSUSHIMA_LAND.h * TSUSHIMA_LAND.w);
  let p = 0, val = 0, i = 0;
  while (i < bin.length && p < grid.length) {
    let run = 0, shift = 0, byte;
    do { byte = bin.charCodeAt(i++); run |= (byte & 127) << shift; shift += 7; } while (byte & 128);
    if (val) grid.fill(1, p, Math.min(p + run, grid.length));
    p += run; val ^= 1;
  }
  TSUSHIMA_LAND.grid = grid;
})();
// 좌표가 육지 격자인지
function _isLandTsushima(lat, lon) {
  const T = TSUSHIMA_LAND;
  const i = Math.round(lat / T.cell) - T.i0, j = Math.round(lon / T.cell) - T.j0;
  if (i < 0 || j < 0 || i >= T.h || j >= T.w) return false;
  return T.grid[i * T.w + j];
}
