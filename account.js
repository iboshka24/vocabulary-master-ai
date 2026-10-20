/* Accounts and cloud progress through Supabase (Auth + one row per user in public.progress, protected by RLS).
   Talks to the Supabase REST endpoints directly — no SDK, nothing loaded from a CDN.
   client() and plan() are pure enough to test in Node (test/account.js); mount() draws the account dialog. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VMAccount = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  var STORE = 'vm.auth', META = 'vm.sync';

  function fail(code, status) { var e = new Error(code); e.code = code; e.status = status || 0; return e; }

  // Supabase answers differ between versions; everything is reduced to a few stable codes the UI can explain.
  function errorCode(status, body) {
    var b = body || {}, c = String(b.error_code || b.code || b.error || ''), m = String(b.msg || b.error_description || b.message || '');
    if (/refresh.?token/i.test(c + ' ' + m) || c === 'bad_jwt' || c === 'session_not_found') return 'signed-out';
    if (c === 'invalid_credentials' || c === 'invalid_grant' || /invalid login/i.test(m)) return 'bad-login';
    if (c === 'email_not_confirmed' || /not confirmed/i.test(m)) return 'not-confirmed';
    if (c === 'user_already_exists' || c === 'email_exists' || /already (been )?registered/i.test(m)) return 'exists';
    if (c === 'weak_password' || /password/i.test(m)) return 'weak-password';
    if (status === 429 || /rate limit/i.test(c + m)) return 'rate-limit';
    if (c === 'email_address_invalid' || c === 'validation_failed' || /email/i.test(m)) return 'bad-email';
    if (status === 401 || status === 403) return 'signed-out';
    return 'server';
  }

  function client(cfg, opts) {
    opts = opts || {};
    var base = String(cfg.url || '').replace(/\/+$/, ''), key = cfg.key;
    var doFetch = opts.fetch || function (u, o) { return fetch(u, o); };
    var store = opts.storage, now = opts.now || Date.now;

    function load() { try { return JSON.parse(store.getItem(STORE) || 'null'); } catch (e) { return null; } }
    function save(s) { try { if (s) store.setItem(STORE, JSON.stringify(s)); else store.removeItem(STORE); } catch (e) {} }

    async function req(path, o) {
      o = o || {};
      var headers = { apikey: key, 'Content-Type': 'application/json', Authorization: 'Bearer ' + (o.token || key) };
      Object.keys(o.headers || {}).forEach(function (h) { headers[h] = o.headers[h]; });
      var res;
      try {
        res = await doFetch(base + path, { method: o.method || 'GET', headers: headers, body: o.body === undefined ? undefined : JSON.stringify(o.body),
          signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(20000) : undefined });
      } catch (e) { throw fail('offline'); }
      var text = '', json = null;
      try { text = await res.text(); json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
      if (!res.ok) throw fail(errorCode(res.status, json), res.status);
      return json;
    }
    function keep(json) {
      if (!json || !json.access_token || !json.refresh_token || !json.user) throw fail('server');
      var s = { access: json.access_token, refresh: json.refresh_token, expires: now() + (Number(json.expires_in) || 3600) * 1000, user: { id: json.user.id, email: json.user.email } };
      save(s);
      return s.user;
    }
    var refreshing = null;
    async function refresh() {
      var s = load();
      if (!s) throw fail('signed-out');
      try { return keep(await req('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: s.refresh } })); }
      catch (e) { if (e.code !== 'offline' && e.code !== 'server') save(null); throw e.code === 'offline' || e.code === 'server' ? e : fail('signed-out'); }
    }
    async function token() {
      var s = load();
      if (!s) throw fail('signed-out');
      if (s.expires - now() < 60000) { refreshing = refreshing || refresh().finally(function () { refreshing = null; }); await refreshing; s = load(); }
      return s.access;
    }
    function redirectQuery(url) { return url ? '?redirect_to=' + encodeURIComponent(url) : ''; }

    return {
      user: function () { var s = load(); return s ? s.user : null; },
      signUp: async function (email, password, redirect) {
        var json = await req('/auth/v1/signup' + redirectQuery(redirect), { method: 'POST', body: { email: email, password: password } });
        if (json && json.access_token) { keep(json); return { signedIn: true }; }
        return { confirm: true }; // also what Supabase says for an address that already exists, so accounts cannot be probed
      },
      signIn: async function (email, password) {
        return keep(await req('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: email, password: password } }));
      },
      signOut: async function () {
        var s = load();
        save(null);
        if (s) { try { await req('/auth/v1/logout', { method: 'POST', token: s.access }); } catch (e) {} }
      },
      recover: async function (email, redirect) { await req('/auth/v1/recover' + redirectQuery(redirect), { method: 'POST', body: { email: email } }); },
      setPassword: async function (password) { await req('/auth/v1/user', { method: 'PUT', token: await token(), body: { password: password } }); },
      // Links from confirmation and reset e-mails come back as #access_token=…&refresh_token=…&type=signup|recovery.
      fromHash: async function (hash) {
        var p = new URLSearchParams(String(hash || '').replace(/^#/, ''));
        if (p.get('error_description') || p.get('error')) return { error: p.get('error_code') || p.get('error') || 'server' };
        if (!p.get('access_token') || !p.get('refresh_token')) return null;
        var user = await req('/auth/v1/user', { token: p.get('access_token') });
        keep({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token'), expires_in: p.get('expires_in'), user: user });
        return { type: p.get('type') || 'signup' };
      },
      pull: async function () {
        var t = await token(), u = load().user;
        var rows = await req('/rest/v1/progress?select=data,updated_at&user_id=eq.' + encodeURIComponent(u.id), { token: t });
        return Array.isArray(rows) && rows[0] ? rows[0] : null;
      },
      push: async function (data) {
        var t = await token(), u = load().user;
        var rows = await req('/rest/v1/progress?on_conflict=user_id', { method: 'POST', token: t, body: { user_id: u.id, data: data },
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' } });
        return Array.isArray(rows) && rows[0] ? rows[0].updated_at : null;
      },
      wipe: async function () {
        var t = await token(), u = load().user;
        await req('/rest/v1/progress?user_id=eq.' + encodeURIComponent(u.id), { method: 'DELETE', token: t });
      }
    };
  }

  // What to do after reading the cloud copy. meta: what this device knew at its last sync.
  function plan(meta, userId, remote, dirty) {
    if (!remote) return 'push';
    if (!meta || meta.user !== userId) return 'merge';       // first time this device meets this account
    if (remote.updated_at === meta.rev) return dirty ? 'push' : 'none';
    return dirty ? 'merge' : 'pull';                         // another device saved in the meantime
  }

  /* ---------------- dialog and background sync ---------------- */

  function mount(cfg, api) {
    var doc = document, $ = function (id) { return doc.getElementById(id); };
    var c = client(cfg, { storage: localStorage });
    var meta = readMeta(), busy = false, again = false, timer = null, quiet = false, mode = 'in', opener = null, lastError = '';
    function readMeta() { try { return JSON.parse(localStorage.getItem(META) || 'null') || {}; } catch (e) { return {}; } }
    function writeMeta() { try { localStorage.setItem(META, JSON.stringify(meta)); } catch (e) {} }
    var redirect = location.origin + location.pathname;

    function msg(code) { return api.tr('acc.err.' + code) === 'acc.err.' + code ? api.tr('acc.err.server') : api.tr('acc.err.' + code); }
    function show(view) {
      ['accOut', 'accSent', 'accReset', 'accIn'].forEach(function (id) { $(id).hidden = id !== view; });
      $('accError').textContent = '';
    }
    function setMode(m) {
      mode = m;
      $('accTabIn').setAttribute('aria-selected', String(m === 'in')); $('accTabUp').setAttribute('aria-selected', String(m === 'up'));
      $('accSubmit').textContent = api.tr(m === 'in' ? 'acc.signIn' : 'acc.signUp');
      $('accPassword').autocomplete = m === 'in' ? 'current-password' : 'new-password';
      $('accPassword').minLength = m === 'in' ? 1 : 8;
      $('accForgot').hidden = m !== 'in';
      $('accError').textContent = '';
    }
    function render() {
      var u = c.user();
      $('btnAccount').hidden = false;
      $('accountLabel').textContent = u ? u.email.split('@')[0] : api.tr('acc.signIn');
      $('btnAccount').classList.toggle('signed-in', Boolean(u));
      $('btnAccount').title = u ? api.tr('acc.signedInAs', { e: u.email }) : api.tr('acc.cta');
      if (u) {
        $('accEmailShown').textContent = u.email;
        var when = meta.at ? new Date(meta.at).toLocaleString(api.lang(), { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : '';
        $('accSyncState').textContent = busy ? api.tr('acc.syncing') : lastError ? msg(lastError) : meta.dirty ? api.tr('acc.pending') : when ? api.tr('acc.synced', { t: when }) : '';
        $('accSyncState').className = 'acc-sync' + (lastError ? ' bad' : '');
      }
    }
    function open() {
      opener = doc.activeElement;
      $('accountDialog').hidden = false;
      if (c.user()) { show('accIn'); render(); $('btnSyncNow').focus(); }
      else if (!$('accReset').hidden) $('accNewPassword').focus();
      else { show('accOut'); setMode(mode); $('accEmail').focus(); }
    }
    function close() { $('accountDialog').hidden = true; if (opener && opener.focus && doc.contains(opener)) opener.focus(); }

    async function sync(reason) {
      var u = c.user();
      if (!u) return;
      if (busy) { again = true; return; }
      busy = true; lastError = ''; render();
      try {
        var remote = await c.pull();
        var action = plan(meta, u.id, remote, meta.dirty || meta.user !== u.id);
        if (action === 'pull' || action === 'merge') {
          var next = action === 'pull' ? remote.data : api.merge(api.getData(), remote.data);
          quiet = true;
          try { if (!api.setData(next)) throw fail('bad-data'); } finally { quiet = false; }
        }
        if (action === 'push' || action === 'merge') meta.rev = await c.push(api.getData());
        else if (remote) meta.rev = remote.updated_at;
        meta.user = u.id; meta.dirty = false; meta.at = Date.now(); writeMeta();
        return action;
      } catch (e) {
        lastError = e.code || 'server';
        if (lastError === 'signed-out') { api.toast(api.tr('acc.err.signed-out'), 'err', 5000); }
      } finally {
        busy = false; render();
        if (again) { again = false; schedule(500); }
      }
    }
    function schedule(ms) { clearTimeout(timer); timer = setTimeout(function () { sync('auto'); }, ms); }

    async function afterSignIn() {
      show('accIn'); render(); $('btnSyncNow').focus();
      var action = await sync('signin');
      api.toast(api.tr(action === 'merge' ? 'acc.merged' : 'acc.welcome'), 'ok', 4000);
    }

    $('btnAccount').onclick = open;
    $('accClose').onclick = close;
    $('accountDialog').addEventListener('click', function (e) { if (e.target === this) close(); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('accountDialog').hidden) { e.preventDefault(); close(); } });
    $('accTabIn').onclick = function () { setMode('in'); $('accEmail').focus(); };
    $('accTabUp').onclick = function () { setMode('up'); $('accEmail').focus(); };
    $('accForm').onsubmit = async function (e) {
      e.preventDefault();
      var email = $('accEmail').value.trim(), pw = $('accPassword').value;
      if (mode === 'up' && pw.length < 8) { $('accError').textContent = api.tr('acc.err.weak-password'); return; }
      $('accSubmit').disabled = true; $('accError').textContent = '';
      try {
        if (mode === 'in') { await c.signIn(email, pw); $('accPassword').value = ''; await afterSignIn(); }
        else {
          var r = await c.signUp(email, pw, redirect);
          $('accPassword').value = '';
          if (r.signedIn) await afterSignIn();
          else { show('accSent'); $('accSentText').textContent = api.tr('acc.checkMail', { e: email }); }
        }
      } catch (err) { $('accError').textContent = msg(err.code); }
      finally { $('accSubmit').disabled = false; }
    };
    $('accForgot').onclick = async function () {
      var email = $('accEmail').value.trim();
      if (!email || !$('accEmail').checkValidity()) { $('accError').textContent = api.tr('acc.needEmail'); $('accEmail').focus(); return; }
      try { await c.recover(email, redirect); show('accSent'); $('accSentText').textContent = api.tr('acc.resetSent', { e: email }); }
      catch (err) { $('accError').textContent = msg(err.code); }
    };
    $('accBack').onclick = function () { show('accOut'); setMode('in'); $('accEmail').focus(); };
    $('accReset').onsubmit = async function (e) {
      e.preventDefault();
      var pw = $('accNewPassword').value;
      if (pw.length < 8) { $('accError').textContent = api.tr('acc.err.weak-password'); return; }
      try { await c.setPassword(pw); $('accNewPassword').value = ''; api.toast(api.tr('acc.passwordSet'), 'ok'); await afterSignIn(); }
      catch (err) { $('accError').textContent = msg(err.code); }
    };
    $('btnSyncNow').onclick = function () { sync('manual'); };
    $('btnSignOut').onclick = async function () {
      await c.signOut();
      meta = {}; writeMeta(); lastError = '';
      show('accOut'); setMode('in'); render();
      api.toast(api.tr('acc.signedOut'), 'ok', 4000);
    };
    $('btnWipeCloud').onclick = async function () {
      if (!window.confirm(api.tr('acc.wipeConfirm'))) return;
      try { await c.wipe(); meta.rev = null; meta.dirty = true; writeMeta(); api.toast(api.tr('acc.wiped'), 'ok', 4000); render(); }
      catch (err) { api.toast(msg(err.code), 'err'); }
    };
    // Unsent changes leave with the page when it is closed or hidden.
    doc.addEventListener('visibilitychange', function () { if (doc.visibilityState === 'hidden' && meta.dirty && c.user()) sync('hide'); });
    window.addEventListener('online', function () { if (meta.dirty && c.user()) schedule(1000); });

    render();
    // Returns true when the address carried an auth link (it is handled and removed).
    async function handleHash() {
      var h = location.hash;
      if (/access_token=|error_description=/.test(h)) {
        history.replaceState(null, '', location.pathname + location.search); // tokens never stay in the address bar
        try {
          var r = await c.fromHash(h);
          if (r && r.error) { open(); show('accOut'); setMode('in'); $('accError').textContent = api.tr('acc.err.link'); return true; }
          if (r && r.type === 'recovery') { opener = doc.activeElement; $('accountDialog').hidden = false; show('accReset'); render(); $('accNewPassword').focus(); return true; }
          if (r) { open(); await afterSignIn(); return true; }
        } catch (e) { open(); $('accError').textContent = msg(e.code); return true; }
      }
      return false;
    }
    window.addEventListener('hashchange', handleHash); // a link opened in a tab that already shows the site
    handleHash().then(function (handled) { if (!handled && c.user()) sync('load'); });

    return {
      changed: function () { if (quiet) return; meta.dirty = true; writeMeta(); if (c.user()) schedule(3000); },
      refresh: render,
      user: function () { return c.user(); }
    };
  }

  return { client: client, plan: plan, errorCode: errorCode, mount: mount, STORE: STORE, META: META };
});
