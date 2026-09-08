/* ══════════════════════════════════════════════════════════════
   로그인 문 — 아무나 들어오지 못하게 막는 문턱
   ══════════════════════════════════════════════════════════════

   ⚠ 한계를 먼저 적어 둔다. 이건 "차단"이 아니라 "문턱"이다.
     · 정적 페이지라 확인이 브라우저 안에서 일어난다. 이 파일을 열어 보면
       방식과 해시가 그대로 보이고, 개발자도구로 문을 지울 수도 있다.
     · 문을 세워도 index.html·CSV 같은 파일은 주소를 직접 치면 그대로 받아진다.
     · 그래서 지나가던 사람이 우연히 들어오는 것은 막아 주지만, 작정하고
       들여다보려는 사람은 막지 못한다.
   진짜로 막으려면 서버 앞단에서 걸러야 한다 — Cloudflare Access 를 도메인에
   붙이거나, 로그인을 지원하는 호스팅으로 옮기는 쪽이다.

   ⚠ 지금 비밀번호는 네 자리 숫자다. 아래 해시를 손에 넣으면 0000~9999 를
     전부 돌려 보는 데 8밀리초면 된다(실측). 화면의 5회 잠금은 사람이 직접
     칠 때만 걸리지, 해시를 떠다 놓고 돌리는 것은 못 막는다.
     즉 이 문은 '우연히 들어온 사람'만 돌려세운다.

   비밀번호는 그대로 적지 않고 소금(salt)을 섞은 SHA-256 값만 둔다.
   바꾸려면 아래 한 줄을 돌려 나온 SALT·HASH 를 갈아 끼우면 된다.

     node -e "const c=require('crypto');const salt=c.randomBytes(16).toString('hex');
     const h=c.createHash('sha256').update(salt+':'+'아이디'.toUpperCase()+':'+'비밀번호').digest('hex');
     console.log('SALT='+salt+'\nHASH='+h)"
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SALT = 'f2469c6d7e9452108ca06be18d00dc48';
  var HASH = '45995e15cf74a6c4e390c6ab922fd6d3a1e09f0aec6ad0491c9e0b9e3156ac45';
  var KEY = 'hanjil_auth';
  var TTL_H = 12;          // 한 번 들어오면 이 시간 동안은 다시 묻지 않는다
  var LOCK_TRIES = 5;      // 이만큼 틀리면
  var LOCK_SEC = 60;       // 이 시간 동안 잠근다

  // ── 이미 통과했는가 ──
  function passed() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      return !!(v && v.h === HASH && v.exp > Date.now());
    } catch (e) { return false; }
  }
  function remember() {
    try { localStorage.setItem(KEY, JSON.stringify({ h: HASH, exp: Date.now() + TTL_H * 3600000 })); } catch (e) {}
  }
  // 다른 곳에서 부를 수 있게 열어 둔다 (로그아웃 버튼 등)
  window.hanjilLogout = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    location.reload();
  };

  if (passed()) return;

  // ── SHA-256 ──
  // crypto.subtle 은 https 나 localhost 에서만 쓸 수 있다. file:// 로 열면
  // 없을 수 있어서, 그때는 문을 세우지 않고 그냥 지나가게 둔다(작업 중 자기 PC).
  function sha256(text) {
    if (!(window.crypto && crypto.subtle)) return Promise.resolve(null);
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      var b = new Uint8Array(buf), s = '';
      for (var i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, '0');
      return s;
    });
  }

  // ── 문 ──
  var css = [
    '#authGate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;',
    'justify-content:center;padding:20px;background:#0B1B33;',
    "font-family:'Pretendard GOV','Pretendard',-apple-system,'Malgun Gothic',sans-serif;color:#E8F4FF}",
    '#authGate .box{width:100%;max-width:340px}',
    '#authGate h1{margin:0 0 4px;font-size:17px;font-weight:700;letter-spacing:-.02em}',
    '#authGate p.sub{margin:0 0 22px;font-size:12px;color:#8FB3D6;line-height:1.6}',
    '#authGate label{display:block;font-size:11.5px;color:#8FB3D6;margin:0 0 5px}',
    '#authGate input{width:100%;box-sizing:border-box;background:rgba(255,255,255,.06);',
    'border:1px solid rgba(120,170,225,.35);border-radius:5px;color:#E8F4FF;',
    'font-family:inherit;font-size:14px;padding:9px 11px;margin-bottom:13px}',
    '#authGate input:focus{outline:none;border-color:#5BA3D9;box-shadow:0 0 0 3px rgba(91,163,217,.18)}',
    '#authGate button{width:100%;background:#154B8C;border:1px solid #2E6DB4;border-radius:5px;',
    'color:#fff;font-family:inherit;font-size:14px;font-weight:700;padding:10px;cursor:pointer}',
    '#authGate button:hover:not(:disabled){background:#1A5AA6}',
    '#authGate button:disabled{opacity:.5;cursor:default}',
    '#authGate .msg{min-height:17px;margin-top:11px;font-size:11.5px;color:#FF9E90;line-height:1.5}',
    '#authGate .foot{margin-top:26px;font-size:10.5px;color:#5C7B9C;line-height:1.7}'
  ].join('');

  function build() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var g = document.createElement('div');
    g.id = 'authGate';
    g.innerHTML =
      '<div class="box">' +
        '<h1>부관훼리 항로 분석</h1>' +
        '<p class="sub">내부 검토용 자료입니다. 계정을 입력해 주세요.</p>' +
        '<form id="authForm" autocomplete="off">' +
          '<label for="authId">아이디</label>' +
          '<input id="authId" name="username" type="text" autocomplete="username" spellcheck="false" autocapitalize="characters">' +
          '<label for="authPw">비밀번호</label>' +
          '<input id="authPw" name="password" type="password" autocomplete="current-password">' +
          '<button type="submit" id="authGo">들어가기</button>' +
        '</form>' +
        '<div class="msg" id="authMsg" role="status" aria-live="polite"></div>' +
        '<div class="foot">열람 권한이 없다면 창을 닫아 주세요.<br>문의: 재무회계팀</div>' +
      '</div>';
    document.body.appendChild(g);

    var form = g.querySelector('#authForm');
    var idEl = g.querySelector('#authId');
    var pwEl = g.querySelector('#authPw');
    var btn = g.querySelector('#authGo');
    var msg = g.querySelector('#authMsg');
    var tries = 0;
    idEl.focus();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var id = (idEl.value || '').trim().toUpperCase();
      var pw = pwEl.value || '';
      if (!id || !pw) { msg.textContent = '아이디와 비밀번호를 모두 입력해 주세요.'; return; }
      btn.disabled = true;
      sha256(SALT + ':' + id + ':' + pw).then(function (h) {
        if (h === null) {          // 해시를 쓸 수 없는 환경 — 확인을 못 하므로 통과시킨다
          msg.textContent = '이 환경에서는 확인할 수 없어 그대로 엽니다.';
          remember(); g.remove(); return;
        }
        if (h === HASH) { remember(); g.remove(); return; }
        tries++;
        pwEl.value = '';
        if (tries >= LOCK_TRIES) {
          var left = LOCK_SEC;
          msg.textContent = '여러 번 틀렸습니다. ' + left + '초 뒤에 다시 시도해 주세요.';
          var t = setInterval(function () {
            left--;
            if (left > 0) { msg.textContent = '여러 번 틀렸습니다. ' + left + '초 뒤에 다시 시도해 주세요.'; return; }
            clearInterval(t);
            tries = 0; msg.textContent = ''; btn.disabled = false; pwEl.focus();
          }, 1000);
          return;
        }
        msg.textContent = '아이디 또는 비밀번호가 맞지 않습니다. (' + tries + '/' + LOCK_TRIES + ')';
        btn.disabled = false;
        pwEl.focus();
      });
    });
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
