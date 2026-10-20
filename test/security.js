/* Static guards for the deployment's security headers and the markup they depend on. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { headersFor } = require('../tools/vercel-headers.js');

const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const html = read('index.html');
const page = headersFor('/');
const csp = Object.fromEntries(page['Content-Security-Policy'].split(';').map(d => d.trim().split(/\s+/)).map(([k, ...v]) => [k, v]));

// CSP: strict, no unsafe-*, every inline script allowed by its exact hash
assert(!/unsafe-(inline|eval|hashes)/.test(page['Content-Security-Policy']), 'no unsafe-* sources');
for (const d of ['default-src', 'script-src', 'style-src', 'font-src', 'connect-src', 'worker-src', 'object-src', 'base-uri', 'frame-ancestors', 'form-action']) assert(csp[d], d + ' is set');
assert.deepEqual(csp['frame-ancestors'], ["'none'"]); assert.deepEqual(csp['object-src'], ["'none'"]);
assert.deepEqual(csp['style-src'], ["'self'"]); assert.deepEqual(csp['font-src'], ["'self'"]);
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
for (const code of inline) {
  const hash = "'sha256-" + crypto.createHash('sha256').update(code, 'utf8').digest('base64') + "'";
  assert(csp['script-src'].includes(hash), 'inline script must be allowed by hash ' + hash + ' (update vercel.json after editing it)');
}
assert.equal(csp['script-src'].length, 1 + inline.length, 'script-src lists only self and the inline hashes');

// connect-src matches the providers the server accepts for own keys, plus the free translator
const providers = read('api/ai.js').match(/PROVIDER_HOSTS = \[([^\]]+)\]/)[1].match(/'([^']+)'/g).map(h => 'https://' + h.slice(1, -1));
assert.deepEqual(csp['connect-src'].slice().sort(), ["'self'", 'https://api.mymemory.translated.net', 'https://*.supabase.co', ...providers].sort());

// other headers
assert.equal(page['X-Content-Type-Options'], 'nosniff');
assert.equal(page['X-Frame-Options'], 'DENY');
assert.equal(page['Referrer-Policy'], 'strict-origin-when-cross-origin');
assert.match(page['Permissions-Policy'], /microphone=\(\)/, 'speech synthesis needs no microphone');
assert.match(page['Permissions-Policy'], /camera=\(\)/);
assert.match(page['Strict-Transport-Security'], /max-age=\d{7,}/);
assert.equal(headersFor('/sw.js')['Cache-Control'], 'no-cache');
assert.equal(headersFor('/vendor/fonts/fonts.css')['Cache-Control'], 'public, max-age=31536000, immutable');
assert.equal(headersFor('/swXjs')['Cache-Control'], undefined, 'dots in sources are literal');

// markup that would need unsafe-inline under this policy
assert(!/\son[a-z]+\s*=/i.test(html), 'no inline event handlers in index.html');
assert(!/\sstyle\s*=/i.test(html), 'no style attributes in index.html');
for (const f of ['app.js', 'motion.js', 'i18n.js', 'games.js', 'account.js']) {
  const src = read(f);
  assert(!/style=\\?["']/.test(src), f + ': no style attributes in generated markup');
  assert(!/\son[a-z]+=\\?["']/.test(src), f + ': no inline handlers in generated markup');
  assert(!/\beval\(|new Function\(/.test(src), f + ': no eval');
}

// no third-party resources: everything is served from this origin
const refs = [...html.matchAll(/<(?:script|link|img|video|source)\b[^>]*\s(?:src|href)="([^"]+)"/g)].map(m => m[1]);
for (const ref of refs) assert(!/^(https?:)?\/\//.test(ref) || ref.startsWith('https://github.com/'), 'external resource: ' + ref);
for (const f of ['styles.css', 'editorial.css', 'shell.css', 'motion.css', 'vendor/fonts/fonts.css']) assert(!/url\((["']?)(https?:)?\/\//.test(read(f)), f + ': no remote url()');
assert(fs.existsSync(path.join(root, 'vendor/fonts/OFL-inter.txt')), 'font licenses ship with the fonts');

// the dev server applies the same headers
assert(/vercelHeaders\.apply\(res, url\.pathname\)/.test(read('tools/dev-server.js')));
console.log('✓ Security headers: strict CSP (hash-only scripts, no unsafe-*), connect-src = server allow-list, no inline styles/handlers, self-hosted assets');
