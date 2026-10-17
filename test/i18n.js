const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const I = require('../i18n');

for (const [key, entry] of Object.entries(I.dict)) {
  assert.equal(entry.length, 3, key + ' must have ru, en and uz');
  entry.forEach((v, i) => assert(v && (typeof v === 'string' || Array.isArray(v)), key + ' is empty for ' + I.codes[i]));
  const vars = s => [...new Set([].concat(s).join(' ').match(/\{\w+\}/g) || [])].sort().join();
  assert.equal(vars(entry[1]), vars(entry[0]), key + ': en placeholders differ from ru');
  assert.equal(vars(entry[2]), vars(entry[0]), key + ': uz placeholders differ from ru');
}

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const used = [...html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map(m => m[1])
  .concat([...html.matchAll(/data-i18n-attr="([^"]+)"/g)].flatMap(m => m[1].split(',').map(p => p.split(':')[1])));
const code = ['app.js', 'motion.js'].map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
used.push(...[...code.matchAll(/\btrn?\('([a-zA-Z]+\.[a-zA-Z0-9]+)'/g)].map(m => m[1]));
for (const key of used) assert(I.dict[key], 'missing translation key: ' + key);

assert.equal(I.tn('words.count', 1), '1 слово');
assert.equal(I.tn('words.count', 3), '3 слова');
assert.equal(I.tn('words.count', 11), '11 слов');
assert.equal(I.t('load.free', { i: 2, n: 5 }), 'Перевод без API (2 из 5)…');
console.log('✓ i18n: ' + Object.keys(I.dict).length + ' keys × 3 languages, every key used in HTML/JS exists');
