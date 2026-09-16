// i18n.js — Korean / Japanese translations for 여객정원260_분석_2015-2025.html
const I18N = {
  ko: {
    pageTitle: '여객 정원 260명 초과 분석',
    pageTitleFull: '여객 정원 260명 초과 분석 2015–2025',
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
    h2Dist: '초과 규모 분포<span>초과 항차를 초과 인원 크기로 구분</span>', spanDist: '초과 항차를 초과 인원 크기로 구분',
    h2Year: '연도별 집계<span>코로나 기간 제외</span>', spanYear: '코로나 기간 제외',
    h2Heat: '성수기 · 비수기 히트맵<span>연도 × 월</span>', spanHeat: '연도 × 월',
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

    // KRW formatting units
    unitEok: '억', unitMan: '만',

    // cards() dynamic strings
    unitYear: '연', unitMonth: '월',
    yrSpanLabel: '년',
    noteIn: '입항', noteOut: '출항',
    noteInSum: '입항', noteOutSum: '출항',
    noteOpDays: '운항', noteOpDaysUnit: '일',
    noteVoyIn: '입항', noteVoyOut: '출항',
    unitPax: '명', unitVoy: '항차',
    noteCapRatio: '정원 260명 대비',
    noteUnitAvg: '평균 여객',
    noteBasis: '기준',
    notePctOfTotal: '여객 합계의',
    noteExInOut: '입항', noteExInOut2: '출항',
    noteExPctOfAll: '전체 항차의',
    notePerExVoy: '초과 항차 1회당 태우지 못하는 인원',
    noteNoEx: '초과 항차 없음',
    noteVsBasis: '기준',
    noteVs2025: '2025년',
    noteVsPeak2017: '2017년 정점의',
    noteVsPaxPct: '예상 여객의',
    noteExVoys2025: '2025년 271항차',
    noteLoss: '초과',
    noteLossDetail: '× (66.62%×',
    noteLossDetail2: '원 + 33.38%×',
    noteLossDetail3: '원) — 정원 260명 만석을 가정한 하한 추정. 실운항 시 100% 객실 점유는 현실적으로 불가능하므로 실질 기회손실은 이를 상회할 수 있음.',
    jpy1: '원',
    jpy2: '(1JPY=',
    jpy3: '원)',
    unitKrw: '원',

    // scope text
    scopeAll: '통합 8개 연도',
    scopeYearCov: ' (코로나 · 통합 집계 제외)',
    scopeSep: ' · 운항 ',
    scopeSep2: '일 · 여객 ',
    scopeSep3: '명 · 260명 초과 ',
    scopeSuffix: '명',

    // covBand label
    covBandLabel: '코로나 기간 · 집계 제외',

    // drawTrend tooltip
    ttEstLabel: '예상',
    ttAxisPax: '명',
    ttLegIn: '입항', ttLegOut: '출항', ttLegSum: '합계',
    ttCov: ' · 코로나(집계 제외)',
    ttSumLabel: '여객 합계',
    ttInLabel: '입항',
    ttOutLabel: '출항',
    ttNoData: '실적 없음',
    ttVoyAvg: '항차평균',
    ttVoyOver: '초과',
    ttVoyCount: '항차',

    // drawBars tooltip
    tbOver: ' 초과 ',
    tbCov: ' · 코로나(집계 제외)',
    tbInOver: '입항 초과', tbOutOver: '출항 초과',
    tbVoy: '항차',

    // heatmap
    hmYearCol: '연도',
    hmMonthSuffix: '월',
    hmYearRow: '연간',
    hmMonthAvgRow: '월 평균',
    hmLegLow: '낮음', hmLegHigh: '높음',
    hmNoteColor: '색이 진할수록',
    hmNoteIs: '이 큽니다. 8개 연도 평균 기준 성수기는',
    hmNoteMonth: '월·',
    hmNoteOff: '월, 비수기는',
    hmNoteOffMonth: '월·',
    hmNoteEnd: '월입니다. 코로나 기간(2020–2022)은 색 기준에서 제외하고 맨 아래에 흐리게 표시했습니다.',
    hmMetAvgU: '명/항차', hmMetSumU: '명', hmMetExU: '명',

    // dist()
    dist501up: '501명 이상',
    distExUp: '+241명 이상',
    distExSuffix: '명',
    distTotLabel: '초과 항차 합계',
    distTotOf: '전체',
    distTotVoyOf: '항차 중',
    distTotPct: '%',

    // yearTable()
    ytSum: '합계', ytAvg: '연평균',
    ytFcYear: '2026년',
    ytCovGrp: '코로나 기간 — 위 합계·연평균에서 제외',
    ytExcBadge: '제외',
    ytVoyUnit: ' 명',
    ytLossUnit: '원',
    ytFcLossUnit: '원',

    // monthTable()
    mtMonthSuffix: '월',
    mtSum: '합계', mtAvg: '월평균',
    mtSumUnit: ' 명',
    mtNoteYear: '년 월별 실적입니다. 평균 행은 실적이 있는 달의 산술평균입니다.',
    mtNoteAll: '2015–2019 · 2023–2025 8개 연도를 같은 달끼리 합산한 계절성 표입니다(코로나 기간 제외). 성수기·비수기 판단에 쓰시면 됩니다.',

    // dayTable()
    dtCovBadge: '코로나',
    dtNoData: '해당 조건의 데이터가 없습니다.',
    dtSumSep: '일 · 여객 ',
    dtSumSep2: '명 · 초과 인원 ',
    dtSumSuffix: '명',
    dtCovSuffix: ' (코로나 기간 포함)',
    dtPaxUnit: ' 명',

    // refresh() h2 strings
    h2TrendAll: '연도별 여객수 추이',
    h2TrendYear: '월별 여객수 추이',
    h2BarsAll: '연도별 260명 초과 인원',
    h2BarsYear: '월별 260명 초과 인원',
    h2MonthSeason: '월별 계절성',
    h2MonthSeasonSpan: '8개 연도 같은 달 합산',
    h2MonthYear: '월별 집계',
    h2RawData: '원본 데이터',
    h2RawCov: ' · 코로나 기간 포함 전체 일자',
    lg1Text: '회색 구간 = 코로나 기간(2020–2022, 집계 제외) · 점선 = 2026년 예상 수요',

    // legend (static HTML)
    lgPaxSum: '여객 합계',
    lgInSP: '입항(SP)', lgOutPS: '출항(PS)',
    lgBarIn: '입항 초과', lgBarOut: '출항 초과',
    lgBarCov: '회색 구간 = 코로나 기간(집계 제외) · 막대 위 숫자는 최대·최소',

    // static HTML notes
    noteDistBody: '정원을 조금 넘는 항차와 크게 넘는 항차를 나눠 본 것입니다. 증선·대형화 판단 시 &ldquo;몇 명짜리 초과가 몇 번&rdquo;인지가 핵심 근거가 됩니다.',
    noteYearBody: '초과 비율 = 260명 초과 항차 ÷ 전체 항차. 손실률 = 초과 인원 ÷ 여객 합계. 연평균 행은 <b>코로나 기간을 뺀 8개 연도</b>의 산술평균이며, 표 아래 2020–2022년은 참고용으로만 표시합니다. <b>2026년 행은 예상 수요 173,825명</b>을 2025년 항차별 여객 분포에 비례 적용(×1.0616)해 추정한 값이며, 실적이 아니므로 합계·평균에 포함하지 않았습니다.',
    noteDayBody: '원본 일일운송실적을 그대로 옮긴 표입니다. 여객 칸이 &ldquo;–&rdquo;인 날은 해당 방향 실적이 없는 날(미운항 등)이며, 260명을 넘은 값은 색으로 표시했습니다.',
    capBody: '<b>참고</b> — 2020~2022년은 코로나로 운항이 사실상 중단되어(2021년 전무, 2022년 16항차) 모든 합계·평균·차트에서 제외했습니다. 드롭다운에서 개별 조회는 가능합니다. 초과 인원은 정원 260명 선박으로 운항했을 때의 <b>이론상 최대 손실</b>이며, 실제로는 예약 단계에서 마감되므로 그대로 놓친 수요는 아닙니다.',

    // dropdown
    ddAll: '통합 (2015–2019 · 2023–2025)',
    ddActGroup: '── 분석 대상 연도 ──',
    ddCovGroup: '── 코로나 기간 (집계 제외) ──',
    ddYearSuffix: '년',
    ddCovSuffix: '년 · 코로나',
    ddRank: '위',
    ddPaxUnit: '명',
  },
  ja: {
    pageTitle: '乗客定員260名超過分析',
    pageTitleFull: '乗客定員260名超過分析 2015–2025',
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
    h2Dist: '超過規模分布<span>超過航海を超過人員規模で分類</span>', spanDist: '超過航海を超過人員規模で分類',
    h2Year: '年別集計<span>コロナ期間除外</span>', spanYear: 'コロナ期間除外',
    h2Heat: '繁忙期・閑散期ヒートマップ<span>年度 × 月</span>', spanHeat: '年度 × 月',
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

    // KRW formatting units (used as secondary display in JA mode)
    unitEok: '억', unitMan: '만',

    // cards() dynamic strings
    unitYear: '年', unitMonth: '月',
    yrSpanLabel: '年',
    noteIn: '入港', noteOut: '出港',
    noteInSum: '入港', noteOutSum: '出港',
    noteOpDays: '運航', noteOpDaysUnit: '日',
    noteVoyIn: '入港', noteVoyOut: '出港',
    unitPax: '名', unitVoy: '航海',
    noteCapRatio: '定員260名対比',
    noteUnitAvg: '平均旅客',
    noteBasis: '基準',
    notePctOfTotal: '旅客合計の',
    noteExInOut: '入港', noteExInOut2: '出港',
    noteExPctOfAll: '全航海の',
    notePerExVoy: '超過航海1回あたり乗船できなかった人員',
    noteNoEx: '超過航海なし',
    noteVsBasis: '基準',
    noteVs2025: '2025年',
    noteVsPeak2017: '2017年ピークの',
    noteVsPaxPct: '予想旅客の',
    noteExVoys2025: '2025年271航海',
    noteLoss: '超過',
    noteLossDetail: '× (66.62%×',
    noteLossDetail2: '円 + 33.38%×',
    noteLossDetail3: '円) — 定員260名満席を仮定した下限推定。実運航では100%客室占有は現実的に不可能なため、実質機会損失はこれを上回る可能性があります。',
    jpy1: '円',
    jpy2: '(1JPY=',
    jpy3: '円)',
    unitKrw: 'ウォン',

    // scope text
    scopeAll: '統合8年間',
    scopeYearCov: ' (コロナ · 統合集計除外)',
    scopeSep: ' · 運航 ',
    scopeSep2: '日 · 旅客 ',
    scopeSep3: '名 · 260名超過 ',
    scopeSuffix: '名',

    // covBand label
    covBandLabel: 'コロナ期間 · 集計除外',

    // drawTrend tooltip
    ttEstLabel: '予想',
    ttAxisPax: '名',
    ttLegIn: '入港', ttLegOut: '出港', ttLegSum: '合計',
    ttCov: ' · コロナ(集計除外)',
    ttSumLabel: '旅客合計',
    ttInLabel: '入港',
    ttOutLabel: '出港',
    ttNoData: '実績なし',
    ttVoyAvg: '航海平均',
    ttVoyOver: '超過',
    ttVoyCount: '航海',

    // drawBars tooltip
    tbOver: ' 超過 ',
    tbCov: ' · コロナ(集計除外)',
    tbInOver: '入港超過', tbOutOver: '出港超過',
    tbVoy: '航海',

    // heatmap
    hmYearCol: '年度',
    hmMonthSuffix: '月',
    hmYearRow: '年間',
    hmMonthAvgRow: '月平均',
    hmLegLow: '低', hmLegHigh: '高',
    hmNoteColor: '色が濃いほど',
    hmNoteIs: 'が多くなります。8年間平均で繁忙期は',
    hmNoteMonth: '月・',
    hmNoteOff: '月、閑散期は',
    hmNoteOffMonth: '月・',
    hmNoteEnd: '月です。コロナ期間(2020–2022)は色の基準から除外し、最下部に薄く表示しています。',
    hmMetAvgU: '名/航海', hmMetSumU: '名', hmMetExU: '名',

    // dist()
    dist501up: '501名以上',
    distExUp: '+241名以上',
    distExSuffix: '名',
    distTotLabel: '超過航海合計',
    distTotOf: '全',
    distTotVoyOf: '航海中',
    distTotPct: '%',

    // yearTable()
    ytSum: '合計', ytAvg: '年平均',
    ytFcYear: '2026年',
    ytCovGrp: 'コロナ期間 — 上記合計・年平均から除外',
    ytExcBadge: '除外',
    ytVoyUnit: ' 名',
    ytLossUnit: '円',
    ytFcLossUnit: '円',

    // monthTable()
    mtMonthSuffix: '月',
    mtSum: '合計', mtAvg: '月平均',
    mtSumUnit: ' 名',
    mtNoteYear: '年 月別実績です。平均行は実績がある月の算術平均です。',
    mtNoteAll: '2015–2019 · 2023–2025 の8年間を同じ月ごとに合算した季節性表です（コロナ期間除外）。繁忙期・閑散期の判断にご活用ください。',

    // dayTable()
    dtCovBadge: 'コロナ',
    dtNoData: '該当条件のデータがありません。',
    dtSumSep: '日 · 旅客 ',
    dtSumSep2: '名 · 超過人員 ',
    dtSumSuffix: '名',
    dtCovSuffix: ' (コロナ期間含む)',
    dtPaxUnit: ' 名',

    // refresh() h2 strings
    h2TrendAll: '年別旅客数推移',
    h2TrendYear: '月別旅客数推移',
    h2BarsAll: '年別260名超過人員',
    h2BarsYear: '月別260名超過人員',
    h2MonthSeason: '月別季節性',
    h2MonthSeasonSpan: '8年間同月合算',
    h2MonthYear: '月別集計',
    h2RawData: '原本データ',
    h2RawCov: ' · コロナ期間含む全日付',
    lg1Text: '灰色区間 = コロナ期間(2020–2022, 集計除外) · 点線 = 2026年予想需要',

    // legend (static HTML)
    lgPaxSum: '旅客合計',
    lgInSP: '入港(SP)', lgOutPS: '出港(PS)',
    lgBarIn: '入港超過', lgBarOut: '出港超過',
    lgBarCov: '灰色区間 = コロナ期間(集計除外) · 棒の上の数字は最大・最小',

    // static HTML notes
    noteDistBody: '定員を少し超える航海と大きく超える航海を分けて見たものです。増船・大型化の判断には「何名超過が何回」かが核心的な根拠となります。',
    noteYearBody: '超過率 = 260名超過航海 ÷ 全航海。損失率 = 超過人員 ÷ 旅客合計。年平均行は<b>コロナ期間を除いた8年間</b>の算術平均であり、表下の2020–2022年は参考表示のみです。<b>2026年行は予想需要173,825名</b>を2025年の航海別旅客分布に比例適用(×1.0616)して推定した値であり、実績ではないため合計・平均に含めていません。',
    noteDayBody: '原本の日次輸送実績をそのまま転記した表です。旅客欄が「–」の日はその方向の実績がない日（欠航など）であり、260名を超えた値は色で表示しています。',
    capBody: '<b>注記</b> — 2020〜2022年はコロナにより運航がほぼ停止されたため（2021年はゼロ、2022年は16航海）、すべての合計・平均・チャートから除外しています。ドロップダウンで個別照会は可能です。超過人員は定員260名の船で運航した場合の<b>理論上の最大損失</b>であり、実際には予約段階で満席になるため、そのまま逃した需要ではありません。',

    // dropdown
    ddAll: '統合 (2015–2019 · 2023–2025)',
    ddActGroup: '── 分析対象年度 ──',
    ddCovGroup: '── コロナ期間 (集計除外) ──',
    ddYearSuffix: '年',
    ddCovSuffix: '年 · コロナ',
    ddRank: '位',
    ddPaxUnit: '名',
  }
};

let LANG = 'ko';

function t(key) {
  return (I18N[LANG] && I18N[LANG][key] != null) ? I18N[LANG][key] : (I18N.ko[key] || key);
}

function applyLang(lang) {
  LANG = lang;
  document.documentElement.lang = lang === 'ja' ? 'ja' : 'ko';
  document.title = t('pageTitleFull');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (el.tagName === 'OPTION' || el.tagName === 'BUTTON' || el.tagName === 'LABEL') el.textContent = val;
    else el.innerHTML = val;
  });
  // Refresh all rendered content
  if (typeof refresh === 'function') refresh();
}
