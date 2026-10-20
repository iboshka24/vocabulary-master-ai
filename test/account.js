/* Accounts: Supabase auth client, cloud progress with row-level security, sync decisions, library merge. */
const assert = require('node:assert/strict');
const A = require('../account.js');
const L = require('../learning.js');
const fake = require('./fake-supabase.js');

function memoryStorage() { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), m }; }
const rejectsWith = async (p, code, why) => assert.rejects(p, e => e.code === code, why + ' → ' + code);

(async () => {
  // ---- error codes from different Supabase versions
  assert.equal(A.errorCode(400, { error: 'invalid_grant', error_description: 'Invalid login credentials' }), 'bad-login');
  assert.equal(A.errorCode(400, { error_code: 'invalid_credentials' }), 'bad-login');
  assert.equal(A.errorCode(400, { error_code: 'email_not_confirmed' }), 'not-confirmed');
  assert.equal(A.errorCode(422, { msg: 'User already registered' }), 'exists');
  assert.equal(A.errorCode(422, { error_code: 'weak_password' }), 'weak-password');
  assert.equal(A.errorCode(429, {}), 'rate-limit');
  assert.equal(A.errorCode(400, { error_code: 'refresh_token_not_found', msg: 'Invalid Refresh Token' }), 'signed-out');
  assert.equal(A.errorCode(500, null), 'server');

  // ---- sign up (confirmation e-mail), sign in, token refresh, sign out
  const sb = fake({ autoConfirm: false, expiresIn: 3600 });
  let t = 1e12;
  const store = memoryStorage();
  const c = A.client({ url: 'https://demo.supabase.co/', key: sb.KEY }, { fetch: sb.fetch, storage: store, now: () => t });
  assert.deepEqual(await c.signUp('ann@example.com', 'correct horse', 'https://app.example/'), { confirm: true }, 'confirmation required: no session yet');
  assert.equal(sb.state.mails[0].redirect, 'https://app.example/', 'the e-mail link returns to the site');
  assert.deepEqual(await c.signUp('ann@example.com', 'whatever1', 'x'), { confirm: true }, 'an existing address looks the same (no account probing)');
  await rejectsWith(c.signIn('ann@example.com', 'correct horse'), 'not-confirmed', 'unconfirmed address');
  assert.equal(c.user(), null);
  // the confirmation link signs in and leaves no token in storage other than the session
  const back = await c.fromHash(sb.state.mails[0].link);
  assert.deepEqual(back, { type: 'signup' });
  assert.equal(c.user().email, 'ann@example.com');
  await c.signOut();
  assert.equal(c.user(), null); assert.equal(store.getItem(A.STORE), null, 'signing out forgets the session');
  await rejectsWith(c.signIn('ann@example.com', 'wrong'), 'bad-login', 'wrong password');
  const user = await c.signIn('ann@example.com', 'correct horse');
  assert.equal(user.email, 'ann@example.com');
  assert(!JSON.stringify(JSON.parse(store.getItem(A.STORE))).includes('correct horse'), 'the password is never stored');
  assert.deepEqual(await c.fromHash('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid'), { error: 'otp_expired' });
  assert.equal(await c.fromHash('#deck=1.abc'), null, 'deck links are not auth links');

  // ---- progress row: push, pull, RLS, expiry → refresh
  assert.equal(await c.pull(), null, 'a new account has no cloud copy');
  const rev1 = await c.push({ v: 1, library: { decks: {}, history: {}, goal: 10, streak: { count: 0 } } });
  assert(rev1, 'the server returns the new revision');
  assert.equal((await c.pull()).updated_at, rev1);
  const before = sb.log.filter(l => l.includes('grant_type=refresh_token')).length;
  t += 3600 * 1000; // the access token expired
  await c.pull();
  assert.equal(sb.log.filter(l => l.includes('grant_type=refresh_token')).length, before + 1, 'an expired token is refreshed once before the request');
  // another account cannot read or overwrite Ann's row
  sb.state.autoConfirm = true;
  const other = A.client({ url: 'https://demo.supabase.co', key: sb.KEY }, { fetch: sb.fetch, storage: memoryStorage(), now: () => t });
  assert.deepEqual(await other.signUp('bob@example.com', 'another pass', ''), { signedIn: true });
  assert.equal(await other.pull(), null, 'Bob does not see Ann\'s progress');
  const bobId = other.user().id, annId = c.user().id;
  assert.notEqual(bobId, annId);
  const bobToken = [...sb.tokens].find(([, id]) => id === bobId)[0];
  assert.equal(sb.handle('POST', '/rest/v1/progress', { apikey: sb.KEY, authorization: 'Bearer ' + bobToken }, { user_id: annId, data: {} })[0], 403, "Bob cannot write Ann's row");
  assert.equal(sb.handle('POST', '/rest/v1/progress', { apikey: sb.KEY, authorization: 'Bearer none' }, { user_id: annId, data: {} })[0], 401, 'no token, no write');
  // a revoked refresh token signs the device out
  t += 3600 * 1000;
  sb.tokens.clear();
  const s = JSON.parse(store.getItem(A.STORE)); s.refresh = 'revoked'; store.setItem(A.STORE, JSON.stringify(s));
  await rejectsWith(c.pull(), 'signed-out', 'revoked session');
  assert.equal(c.user(), null);
  sb.state.offline = true;
  await rejectsWith(other.signIn('bob@example.com', 'another pass'), 'offline', 'no network');
  sb.state.offline = false;
  await c.signIn('ann@example.com', 'correct horse');
  await c.wipe();
  assert.equal(await c.pull(), null, 'the user can delete the cloud copy');
  await c.recover('ann@example.com', 'https://app.example/');
  const reset = sb.state.mails.find(m => m.kind === 'recovery');
  assert.deepEqual(await c.fromHash(reset.link), { type: 'recovery' });
  await c.setPassword('brand new pass');
  await c.signOut();
  assert.equal((await c.signIn('ann@example.com', 'brand new pass')).email, 'ann@example.com', 'the reset password works');

  // ---- sync decisions
  assert.equal(A.plan({}, 'u1', null, false), 'push', 'nothing in the cloud yet');
  assert.equal(A.plan({ user: 'u2' }, 'u1', { updated_at: 'a' }, false), 'merge', 'first sync of this device with this account');
  assert.equal(A.plan({ user: 'u1', rev: 'a' }, 'u1', { updated_at: 'a' }, true), 'push', 'only this device changed');
  assert.equal(A.plan({ user: 'u1', rev: 'a' }, 'u1', { updated_at: 'a' }, false), 'none');
  assert.equal(A.plan({ user: 'u1', rev: 'a' }, 'u1', { updated_at: 'b' }, false), 'pull', 'only the other device changed');
  assert.equal(A.plan({ user: 'u1', rev: 'a' }, 'u1', { updated_at: 'b' }, true), 'merge', 'both changed');

  // ---- library merge
  const phone = { decks: { 'en-ru': { source: 'en', target: 'ru', created: 5, cards: [
    { original: 'apple', translation: 'яблоко', reps: 3, interval: 6, due: 900, added: 50 },
    { original: 'river', translation: 'река', reps: 0 }
  ] } }, history: { '2026-01-01': { answers: 10, correct: 8, celebrated: true }, '2026-01-02': { answers: 2, correct: 1 } }, goal: 15, streak: { count: 4, last: '2026-01-02', freezes: 1, enabled: true } };
  const laptop = { decks: {
    'en-ru': { source: 'en', target: 'ru', created: 3, cards: [{ original: 'Apple', translation: 'яблоко', reps: 1, due: 500, added: 20 }, { original: 'stone', translation: 'камень', reps: 2 }] },
    'de-ru': { source: 'de', target: 'ru', created: 9, cards: [{ original: 'Haus', translation: 'дом' }] }
  }, history: { '2026-01-02': { answers: 6, correct: 6 }, '2025-12-31': { answers: 3, correct: 3 } }, goal: 10, streak: { count: 2, last: '2026-01-02', freezes: 2, enabled: true } };
  const snapshot = JSON.stringify([phone, laptop]);
  const m = L.mergeLibrary(phone, laptop);
  assert.equal(JSON.stringify([phone, laptop]), snapshot, 'inputs are not changed');
  assert.deepEqual(Object.keys(m.decks).sort(), ['de-ru', 'en-ru'], 'decks from both devices');
  assert.deepEqual(m.decks['en-ru'].cards.map(c => c.original), ['apple', 'river', 'stone'], 'words from both, no duplicates (case-insensitive)');
  const apple = m.decks['en-ru'].cards[0];
  assert.equal(apple.reps, 3, 'the copy with more reviews wins'); assert.equal(apple.added, 20, 'the earliest date added is kept');
  assert.equal(m.decks['en-ru'].created, 3);
  assert.deepEqual(m.history['2026-01-02'], { answers: 6, correct: 6 }, 'the busier copy of a day wins');
  assert.equal(m.history['2026-01-01'].celebrated, true); assert(m.history['2025-12-31']);
  assert.equal(m.streak.count, 4, 'the longer streak wins'); assert.equal(m.goal, 15, 'this device keeps its own goal');
  assert.doesNotThrow(() => L.restoreBackup(L.backupFile(m), ['en', 'ru', 'de']), 'the merge is a valid library');
  const twice = L.mergeLibrary(m, laptop);
  assert.deepEqual(twice.decks, m.decks, 'merging again changes nothing');
  console.log('✓ Accounts: Supabase sign-up/confirm/sign-in/refresh/sign-out/reset, RLS on progress, offline and revoked sessions, sync plan, library merge');
})().catch(e => { console.error(e); process.exitCode = 1; });
