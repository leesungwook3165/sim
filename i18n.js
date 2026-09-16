// i18n.js — Korean / Japanese translations for 여객정원260_분석_2015-2025.html
const I18N = {
  ko: {
    pageTitle: '여객 정원 260명 초과 분석',
    pageSub: '부관훼리 일일운송실적 · <b>2015–2019 · 2023–2025</b> 8개 연도 (코로나 기간 2020–2022 제외)',
    scopeLabel: '조회 범위',
    langBtn: '🇯🇵 日本語',
    btnDesc: '▼ 내림차순',
    btnAsc: '▲ 오름차순',
    btnReset: '↺ 원상복귀',
    sectPax: '여객 실적',
    sect260: '260명 초과',
    labA1: '여객 합계', labA2: '항차 수', labA3: '항차 평균 여객',
    labA4: '연평균 여객', labA5: '2026년 예상 여객',
    labB1: '초과 인원 합계', labB2: '초과 항차',
    labB3: '초과 항차당 평균 초과', labB4: '연평균 초과 인원',
    labB5: '2026년 예상 초과 인원', labB6: '추정 손해액',
    badgeEst: '예상', badgeFc: '추정', badgeFare: '운임 기준',
    hmAvg: '항차 평균 여객', hmSum: '여객 합계', hmEx: '260명 초과 인원',
    h2Dist: '초과 규모 분포', spanDist: '초과 항차를 초과 인원 크기로 구분',
    h2Year: '연도별 집계', spanYear: '코로나 기간 제외',
    h2Heat: '성수기 · 비수기 히트맵', spanHeat: '연도 × 월',
    thBand: '여객 구간', thExPax: '초과 인원', thVoy: '항차', thShare: '비중',
    thExSum: '초과 인원 합계',
    thYear: '연도', thDays: '운항일', thVoys: '항차', thPaxSum: '여객 합계',
    thAvgPax: '항차 평균', thExVoy: '초과 항차', thExRate: '초과 비율',
    thExPaxCol: '초과 인원', thExPerVoy: '초과 항차당', thLossRate: '손실률', thEstLoss: '추정 손해액',
    thMonth: '월', thIn: '입항 여객', thOut: '출항 여객', thTotal: '여객 합계',
    thInEx: '입항 초과', thOutEx: '출항 초과', thExTotal: '초과 합계',
    thDate: '일자', thShip: '선명', thInPax: '입항 여객', thInExCol: '입항 초과',
    thOutPax: '출항 여객', thOutExCol: '출항 초과', thExTot: '초과 합계',
    tabOver: '260명 초과 항차만', tabAll: '전체 원본 데이터',
    selMonth: '전체',
    covText: '코로나 기간 · 통합 집계 제외',
    badgeCov: '코로나 기간 · 통합 집계 제외',
  },
  ja: {
    pageTitle: '乗客定員260名超過分析',
    pageSub: '釜関フェリー 日次輸送実績 · <b>2015–2019 · 2023–2025</b> 8年間 (コロナ期間 2020–2022 除外)',
    scopeLabel: '表示範囲',
    langBtn: '🇰🇷 한국어',
    btnDesc: '▼ 降順',
    btnAsc: '▲ 昇順',
    btnReset: '↺ 元の順番',
    sectPax: '旅客実績',
    sect260: '260名超過',
    labA1: '旅客合計', labA2: '航海数', labA3: '航海平均旅客',
    labA4: '年平均旅客', labA5: '2026年予想旅客',
    labB1: '超過人員合計', labB2: '超過航海数',
    labB3: '超過航海あたり平均超過', labB4: '年平均超過人員',
    labB5: '2026年予想超過人員', labB6: '推定損害額',
    badgeEst: '予想', badgeFc: '推定', badgeFare: '運賃基準',
    hmAvg: '航海平均旅客', hmSum: '旅客合計', hmEx: '260名超過人員',
    h2Dist: '超過規模分布', spanDist: '超過航海を超過人員規模で分類',
    h2Year: '年別集計', spanYear: 'コロナ期間除外',
    h2Heat: '繁忙期・閑散期ヒートマップ', spanHeat: '年度 × 月',
    thBand: '旅客区間', thExPax: '超過人員', thVoy: '航海', thShare: '割合',
    thExSum: '超過人員合計',
    thYear: '年度', thDays: '運航日', thVoys: '航海', thPaxSum: '旅客合計',
    thAvgPax: '航海平均', thExVoy: '超過航海', thExRate: '超過率',
    thExPaxCol: '超過人員', thExPerVoy: '超過航海あたり', thLossRate: '損失率', thEstLoss: '推定損害額',
    thMonth: '月', thIn: '入港旅客', thOut: '出港旅客', thTotal: '旅客合計',
    thInEx: '入港超過', thOutEx: '出港超過', thExTotal: '超過合計',
    thDate: '日付', thShip: '船名', thInPax: '入港旅客', thInExCol: '入港超過',
    thOutPax: '出港旅客', thOutExCol: '出港超過', thExTot: '超過合計',
    tabOver: '260名超過航海のみ', tabAll: '全原本データ',
    selMonth: '全期間',
    covText: 'コロナ期間 · 統合集計除外',
    badgeCov: 'コロナ期間 · 統合集計除外',
  }
};

let LANG = 'ko';

function t(key) {
  return (I18N[LANG] && I18N[LANG][key] != null) ? I18N[LANG][key] : (I18N.ko[key] || key);
}

function applyLang(lang) {
  LANG = lang;
  document.documentElement.lang = lang === 'ja' ? 'ja' : 'ko';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (el.tagName === 'OPTION' || el.tagName === 'BUTTON') el.textContent = val;
    else el.innerHTML = val;
  });
  // Refresh all rendered content
  if (typeof refresh === 'function') refresh();
}
