/* End-to-end scenarios in headless Chromium: npm run test:e2e
   (first time: npx playwright install chromium; or set CHROME_PATH to any Chromium build).
   Everything is hermetic: a local static server, a fake translation API, no real network. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const LIB = 'vocabulary-master.library.v2';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.mp4': 'video/mp4' };

// The fake translator knows these words; anything else gets an empty answer.
const DICT = { 'to wander': 'бродить', 'to gather': 'собирать', lantern: 'фонарь', meadow: 'луг', harbor: 'гавань',
  'to whisper': 'шептать', pebble: 'галька', candle: 'свеча', 'to blossom': 'цвести', thunder: 'гром' };
const api = { mode: 'ok', calls: 0 }; // ok | down (network error) | error (HTTP 500)
let serverDown = false;

const server = http.createServer((req, res) => {
  if (serverDown) { req.socket.destroy(); return; }
  if (req.url.startsWith('/api/ai')) {
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'GET') res.end('{"status":"ok","serverKeyConfigured":false}');
    else { res.statusCode = 501; res.end('{"code":"no-key"}'); }
    return;
  }
  const file = path.resolve(root, '.' + decodeURIComponent(req.url === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});

const step = name => console.log('  · ' + name);
async function waitToast(page, text) {
  await page.waitForFunction(t => document.getElementById('toast').textContent.includes(t), text, { timeout: 15000 });
}
async function library(page) { return page.evaluate(k => JSON.parse(localStorage.getItem(k)), LIB); }
// Waits until the next card is on screen and accepts input again.
async function waitCardReady(page, previous) {
  await page.waitForFunction(prev => {
    const card = document.getElementById('card');
    return !card.classList.contains('flipped') && !document.getElementById('rowHidden').hidden && document.getElementById('cardWord').textContent !== prev;
  }, previous, { timeout: 10000 });
}

let browser;
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined });
  const context = await browser.newContext({ locale: 'ru-RU', reducedMotion: 'reduce', acceptDownloads: true, viewport: { width: 1280, height: 900 } });
  await context.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
  await context.route(/api\.mymemory\.translated\.net/, route => {
    api.calls++;
    if (api.mode === 'down') return route.abort('internetdisconnected');
    if (api.mode === 'error') return route.fulfill({ status: 500, body: 'oops' });
    const q = new URL(route.request().url()).searchParams.get('q');
    const text = DICT[q.toLowerCase()];
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ responseData: { translatedText: text || q, match: text ? 1 : 0 }, matches: [] }) });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());

  console.log('E2E');
  step('app loads, service worker installs and takes control');
  await page.goto(origin);
  await page.locator('#screen-setup.active').waitFor();
  assert.equal(await page.evaluate(() => window.isSecureContext), true);
  assert.equal(await page.evaluate(async () => !!(await navigator.serviceWorker.ready).active), true, 'service worker is active');
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const manifest = await page.evaluate(() => fetch('manifest.webmanifest').then(r => r.json()));
  assert.equal(manifest.icons.length, 3);

  step('add words → train with grades 1/3/2/4 → SM-2 intervals survive a reload');
  await page.click('#dirSeg [data-dir="fwd"]');
  await page.fill('#input', 'to wander\nto gather\nlantern\nmeadow\nharbor');
  await page.click('#btnStart');
  await page.locator('#screen-train.active').waitFor();
  const graded = {};
  let previous = '';
  for (const key of ['1', '3', '2', '4']) {
    await waitCardReady(page, previous);
    previous = await page.locator('#cardWord').innerText();
    await page.keyboard.press('Space');
    await page.locator('#card.flipped').waitFor();
    await page.keyboard.press(key);
    graded[previous] = key;
  }
  await waitCardReady(page, previous);
  const expected = { 1: { interval: 0, ease: 1.96, lapses: 1 }, 3: { interval: 1, ease: 2.36 }, 2: { interval: 1, ease: 2.5 }, 4: { interval: 4, ease: 2.6 } };
  const check = async label => {
    const deck = (await library(page)).decks['en-ru'];
    for (const [word, key] of Object.entries(graded)) {
      const c = deck.cards.find(x => x.original === word);
      assert(c, word + ' is saved');
      for (const [field, value] of Object.entries(expected[key])) assert.equal(c[field], value, `${label}: ${word} (key ${key}) ${field}`);
    }
    return deck;
  };
  await check('before reload');
  await page.reload();
  await page.locator('#screen-setup.active').waitFor();
  const deckAfter = await check('after reload');
  assert.equal(deckAfter.cards.find(c => graded[c.original] === '4').due > Date.now() + 3.9 * 864e5, true, 'easy card is due in ~4 days');

  step('offline: app opens from cache, words wait for translation, then load when back online');
  await context.setOffline(true); serverDown = true; api.mode = 'down';
  await page.reload();
  await page.locator('#screen-setup.active').waitFor();
  assert.match(await page.title(), /Vocabulary Master AI/);
  await page.fill('#input', 'to whisper\npebble');
  await page.click('#btnStart');
  await waitToast(page, 'Нет сети');
  assert.equal(await page.locator('#screen-setup.active').count(), 1, 'stays on the setup screen');
  assert.equal(await page.inputValue('#input'), 'to whisper\npebble', 'typed words are kept');
  let pending = (await library(page)).decks['en-ru'].cards.filter(c => ['to whisper', 'pebble'].includes(c.original));
  assert.deepEqual(pending.map(c => c.translation), ['—', '—'], 'untranslated words are saved');
  serverDown = false; api.mode = 'ok';
  await context.setOffline(false);
  await waitToast(page, 'Догрузили');
  pending = (await library(page)).decks['en-ru'].cards.filter(c => ['to whisper', 'pebble'].includes(c.original));
  assert.deepEqual(pending.map(c => c.translation), ['шептать', 'галька']);

  step('translation API errors: partial batch trains, full outage keeps words, circuit breaker stops retries');
  await page.fill('#input', 'candle\nthe unknown word');
  await page.click('#btnStart');
  await page.locator('#screen-train.active').waitFor();
  await waitToast(page, 'без перевода');
  assert.equal(await page.locator('#topPill').innerText(), '1 карточка', 'only the translated word is trained');
  await page.click('#btnExit'); await page.click('#btnNewSet');
  api.mode = 'error'; api.calls = 0;
  await page.fill('#input', 'to blossom\nthunder\nmist\nfog\ndew');
  await page.click('#btnStart');
  await waitToast(page, 'Сервис перевода не ответил');
  assert(api.calls <= 3, `stopped calling a failing API after a couple of errors (calls: ${api.calls})`);
  api.mode = 'ok';

  step('backup: export → wipe → import restores the library exactly; broken JSON is rejected');
  await page.click('#navLibrary');
  const before = await library(page);
  const downloading = page.waitForEvent('download');
  await page.click('#btnExportLibrary');
  const backupPath = await (await downloading).path();
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  assert.deepEqual(backup.library.decks, before.decks, 'export contains every deck and SM-2 field');
  await page.locator('#importLibrary').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{"version":2,"library":{') });
  await waitToast(page, 'повреждён');
  assert.deepEqual(await library(page), before, 'a broken file changes nothing');
  await page.evaluate(k => { localStorage.removeItem(k); }, LIB);
  await page.reload();
  await page.click('#navLibrary');
  assert.equal(await page.locator('.deck-item').count(), 0);
  await page.locator('#importLibrary').setInputFiles(backupPath);
  await waitToast(page, 'Библиотека восстановлена');
  const restored = await library(page);
  for (const key of Object.keys(before.decks)) {
    const strip = d => d.cards.map(({ original, translation, streak, fails, box, due, ease, interval, reps, lapses }) => ({ original, translation, streak, fails, box, due, ease, interval, reps, lapses }));
    assert.deepEqual(strip(restored.decks[key]), strip(before.decks[key]), 'deck ' + key + ' round-trips');
  }
  assert.deepEqual(restored.history, before.history);

  step('storage full: one clear warning, nothing lost, saving resumes when space frees up');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    window.__restoreStorage = () => { Storage.prototype.setItem = original; };
    Storage.prototype.setItem = function (k, v) {
      if (k === 'vocabulary-master.library.v2') { const e = new Error('full'); e.name = 'QuotaExceededError'; throw e; }
      return original.call(this, k, v);
    };
  });
  await page.click('[data-act="practice"]');
  await page.locator('#screen-train.active').waitFor();
  await waitCardReady(page, '');
  await page.keyboard.press('Space'); await page.locator('#card.flipped').waitFor(); await page.keyboard.press('2');
  await waitToast(page, 'Память браузера заполнена');
  await page.evaluate(() => window.__restoreStorage());
  await page.click('#btnExit');
  const answersToday = (await library(page)).history[await page.evaluate(() => VMLearning.day())].answers;
  assert(answersToday >= 1, 'the answer given while storage was full is saved afterwards');

  step('interface language: RU → EN → UZ, choice survives a reload');
  await page.click('#btnContinue');
  await page.click('#navStudy');
  await page.selectOption('#uiLang', 'en');
  assert.equal(await page.locator('#navStudy').innerText(), 'Study words');
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'en');
  await page.selectOption('#uiLang', 'uz');
  assert.equal(await page.locator('#navStudy').innerText(), "So'z o'rganish");
  await page.reload();
  assert.equal(await page.locator('#navStudy').innerText(), "So'z o'rganish");
  assert.equal(await page.inputValue('#uiLang'), 'uz');

  assert.deepEqual(errors, [], 'no uncaught page errors');
  console.log('✓ E2E: service worker, SM-2 persistence, offline + resync, API failures, backup round-trip, storage quota, languages');
})().catch(err => { console.error(err); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); server.close(); });
