/* Visual snapshots of the key screens: npm run screens
   RU/EN/UZ × light/dark × 375/1280 px → test/screens/*.png (git-ignored), plus automatic layout checks:
   horizontal page overflow and text that does not fit its box (clipped or spilling over neighbours).
   Exits with code 1 if a layout problem is found. */
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const vercelHeaders = require('../tools/vercel-headers.js');
const run = require('./harness.js')('test/screens.js', { deadlineMs: 360000 });

const root = path.resolve(__dirname, '..');
const outDir = path.join(__dirname, 'screens');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.mp4': 'video/mp4', '.woff2': 'font/woff2' };
const LANGS = (process.env.SCREENS_LANGS || 'ru,en,uz').split(',');
const THEMES = ['light', 'dark'];
const WIDTHS = [375, 1280];

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  vercelHeaders.apply(res, url);
  if (url.startsWith('/api/ai')) { res.setHeader('Content-Type', 'application/json'); res.end('{"status":"ok","serverKeyConfigured":false}'); return; }
  const file = path.resolve(root, '.' + decodeURIComponent(url === '/' ? '/index.html' : url));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end(); return; } res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream'); res.end(data); });
});

// Runs in the page: text that is wider/taller than its own box, and page-level horizontal scroll.
function layoutProblems() {
  const problems = [];
  if (document.documentElement.scrollWidth > innerWidth + 1) problems.push('page scrolls horizontally: ' + document.documentElement.scrollWidth + 'px > ' + innerWidth + 'px');
  const sel = 'button, label, .nav-link, .chip-btn, .btn, .pill, .badge, .stat span, .stat b, .segmented button, .deck-kicker, h1, h2, .card-word, .match-tile, .quiz-option, .toast, .summary-grid span, .eyebrow, .streak-indicator, .ui-lang';
  for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden' || el.closest('[hidden]')) continue;
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== 'auto') problems.push('text wider than its box: ' + (el.id ? '#' + el.id : el.className || el.tagName) + ' "' + el.textContent.trim().slice(0, 40) + '" (' + el.scrollWidth + ' > ' + el.clientWidth + ')');
  }
  return problems;
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  run.server(server);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = run.browser(await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined }));
  const report = [];
  for (const lang of LANGS) for (const theme of THEMES) for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: width < 600 ? 812 : 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce', locale: lang, hasTouch: width < 600, isMobile: width < 600 });
    await context.addInitScript(([l, t]) => { try { localStorage.setItem('vm.ui-lang', l); localStorage.setItem('vm.theme', t); } catch (e) {} }, [lang, theme]);
    const page = await context.newPage();
    const shot = async scene => {
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      const name = `${lang}-${theme}-${width}-${scene}.png`;
      await page.screenshot({ path: path.join(outDir, name), fullPage: true });
      for (const p of await page.evaluate(layoutProblems)) report.push(`${name}: ${p}`);
    };
    await page.goto(origin);
    await page.locator('#screen-setup.active').waitFor();
    await shot('1-setup');
    await page.click('#btnDemo');
    await page.locator('#screen-train.active').waitFor();
    await page.click('#btnReveal');
    await page.locator('#card.flipped').waitFor();
    await shot('2-training');
    await page.click('#btnKnew2');
    await page.waitForTimeout(400);
    await page.click('#btnExit');
    await page.locator('#summary:not([hidden])').waitFor();
    await shot('3-summary');
    await page.click('#btnNewSet');
    await page.click('#navLibrary');
    await page.locator('.deck-item').first().waitFor();
    await page.locator('.deck-item summary').first().click();
    await shot('4-library');
    await page.click('#navTest');
    await page.click('#btnMatchStart');
    await page.locator('.match-tile').first().waitFor();
    await shot('5-test');
    await page.click('#navProgress');
    await page.locator('#screen-progress.active').waitFor();
    await shot('6-progress');
    await page.click('#navLibrary');
    await page.locator('.deck-item [data-act="share"]').first().click();
    await page.locator('#shareQr svg').waitFor();
    await shot('7-share');
    const link = await page.inputValue('#shareLink');
    await page.keyboard.press('Escape');
    await page.goto(link);
    await page.locator('#sharePreview:not([hidden])').waitFor();
    await shot('8-preview');
    await context.close();
  }
  console.log(`Screens: ${LANGS.length * THEMES.length * WIDTHS.length * 8} snapshots in ${path.relative(root, outDir)}`);
  if (report.length) { console.log('Layout problems:\n  ' + [...new Set(report)].join('\n  ')); process.exitCode = 1; }
  else console.log('✓ No horizontal overflow or clipped text found');
})().catch(err => { console.error(err); process.exitCode = 1; }).finally(() => run.finish());
