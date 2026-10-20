/* A tiny in-memory stand-in for the parts of Supabase the app uses (Auth + the progress table with RLS).
   Used by test/account.js (as a fetch function) and by test/e2e.js (behind the local HTTP server). */
function fakeSupabase(opts) {
  opts = opts || {};
  const KEY = opts.key || 'anon-test-key';
  const users = new Map();      // email -> { id, email, password, confirmed }
  const tokens = new Map();     // access token -> user id
  const refresh = new Map();    // refresh token -> user id
  const rows = new Map();       // user id -> { data, updated_at }
  const log = [];
  let n = 0, clock = Date.parse('2026-01-01T00:00:00Z');
  const state = { autoConfirm: opts.autoConfirm !== false, expiresIn: opts.expiresIn || 3600, mails: [] };

  const byId = id => [...users.values()].find(u => u.id === id);
  function session(u) {
    const access = 'at-' + u.id + '-' + (++n), r = 'rt-' + u.id + '-' + n;
    tokens.set(access, u.id); refresh.set(r, u.id);
    return { access_token: access, refresh_token: r, expires_in: state.expiresIn, token_type: 'bearer', user: { id: u.id, email: u.email } };
  }
  function bearer(headers) { const t = String(headers.authorization || '').replace(/^Bearer\s+/i, ''); return tokens.get(t) || null; }

  function handle(method, url, headers, body) {
    const u = new URL(url, 'http://x'), p = u.pathname, q = u.searchParams;
    log.push(method + ' ' + p + (u.search || ''));
    if (headers.apikey !== KEY) return [401, { message: 'Invalid API key' }];
    if (p === '/auth/v1/signup' && method === 'POST') {
      if (users.has(body.email)) return [200, { id: 'obfuscated', email: body.email, identities: [] }];
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email || '')) return [400, { error_code: 'email_address_invalid', msg: 'Unable to validate email address: invalid format' }];
      if (String(body.password || '').length < 6) return [422, { error_code: 'weak_password', msg: 'Password should be at least 6 characters.' }];
      const user = { id: 'u' + (++n), email: body.email, password: body.password, confirmed: state.autoConfirm };
      users.set(body.email, user);
      if (state.autoConfirm) return [200, session(user)];
      state.mails.push({ to: body.email, kind: 'signup', redirect: q.get('redirect_to'), link: '#' + new URLSearchParams(Object.assign({ type: 'signup' }, Object.fromEntries(Object.entries(session(user)).filter(([k]) => k !== 'user' && k !== 'token_type').map(([k, v]) => [k, String(v)])))) });
      return [200, { id: user.id, email: user.email }];
    }
    if (p === '/auth/v1/token' && method === 'POST') {
      if (q.get('grant_type') === 'password') {
        const user = users.get(body.email);
        if (!user || user.password !== body.password) return [400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' }];
        if (!user.confirmed) return [400, { code: 400, error_code: 'email_not_confirmed', msg: 'Email not confirmed' }];
        return [200, session(user)];
      }
      if (q.get('grant_type') === 'refresh_token') {
        const id = refresh.get(body.refresh_token);
        if (!id) return [400, { code: 400, error_code: 'refresh_token_not_found', msg: 'Invalid Refresh Token: Refresh Token Not Found' }];
        refresh.delete(body.refresh_token);
        return [200, session(byId(id))];
      }
    }
    if (p === '/auth/v1/user') {
      const id = bearer(headers);
      if (!id) return [401, { code: 401, error_code: 'bad_jwt', msg: 'invalid JWT' }];
      const user = byId(id);
      if (method === 'PUT') { if (String(body.password || '').length < 6) return [422, { error_code: 'weak_password', msg: 'Password should be at least 6 characters.' }]; user.password = body.password; }
      user.confirmed = true;
      return [200, { id: user.id, email: user.email }];
    }
    if (p === '/auth/v1/logout' && method === 'POST') { const t = String(headers.authorization || '').replace(/^Bearer\s+/i, ''); tokens.delete(t); return [204, null]; }
    if (p === '/auth/v1/recover' && method === 'POST') {
      const user = users.get(body.email);
      if (user) state.mails.push({ to: body.email, kind: 'recovery', redirect: q.get('redirect_to'), link: '#' + new URLSearchParams({ type: 'recovery', access_token: session(user).access_token, refresh_token: 'rt-' + user.id + '-' + n, expires_in: '3600' }) });
      return [200, {}];
    }
    if (p === '/rest/v1/progress') {
      const id = bearer(headers);
      if (!id) return [401, { code: 'PGRST301', message: 'JWT expired' }];
      const target = (q.get('user_id') || '').replace(/^eq\./, '') || (body && body.user_id);
      if (target !== id) return method === 'GET' ? [200, []] : [403, { code: '42501', message: 'new row violates row-level security policy' }];
      if (method === 'GET') return [200, rows.has(id) ? [Object.assign({}, rows.get(id))] : []];
      if (method === 'POST') {
        clock += 1000;
        rows.set(id, { data: JSON.parse(JSON.stringify(body.data)), updated_at: new Date(clock).toISOString() });
        return [201, [Object.assign({ user_id: id }, rows.get(id))]];
      }
      if (method === 'DELETE') { rows.delete(id); return [204, null]; }
    }
    return [404, { message: 'not found' }];
  }

  // fetch-compatible wrapper for Node tests
  async function fetchFn(url, o) {
    o = o || {};
    const headers = Object.fromEntries(Object.entries(o.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
    if (state.offline) throw new TypeError('Failed to fetch');
    const [status, json] = handle(o.method || 'GET', url, headers, o.body ? JSON.parse(o.body) : null);
    const text = json == null ? '' : JSON.stringify(json);
    return { ok: status >= 200 && status < 300, status, text: async () => text };
  }
  return { handle, fetch: fetchFn, users, rows, tokens, log, state, KEY };
}
module.exports = fakeSupabase;
