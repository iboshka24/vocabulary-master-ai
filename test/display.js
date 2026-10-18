/* Display settings: normalisation, resolution, and the real inline boot script in index.html
   (run in a sandbox) must produce exactly what display.js computes — so there is no flash or mismatch. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const D = require('../display');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const boot = html.match(/<head>[\s\S]*?<script>([\s\S]*?)<\/script>/)[1];

function store(entries) {
  const data = { ...entries };
  return { getItem: k => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, data };
}
function runBoot(entries, prefersDark) {
  const dataset = {};
  vm.runInNewContext(boot, {
    localStorage: store(entries),
    matchMedia: q => ({ matches: /dark/.test(q) && prefersDark }),
    document: { documentElement: { dataset } },
    JSON
  });
  return dataset;
}
const asDataset = r => Object.fromEntries(Object.entries(r).filter(([, v]) => v));

// normalize: unknown values fall back, legacy theme is honoured
assert.deepEqual(D.normalize(null), D.DEFAULTS);
assert.deepEqual(D.normalize({ theme: 'purple', size: 'xxl', contrast: 'yes', spacing: 1 }), D.DEFAULTS, 'only exact values are accepted');
assert.equal(D.normalize({}, 'dark').theme, 'dark', 'pre-v2.15 "vm.theme" is kept');
assert.equal(D.normalize({ theme: 'system' }, 'dark').theme, 'system', 'the new setting wins over the legacy key');
assert.deepEqual(D.normalize([1, 2]), D.DEFAULTS);

// resolve: system follows the OS, defaults add no attributes
assert.deepEqual(D.resolve({ theme: 'system' }, true), { theme: 'dark', size: null, contrast: null, spacing: null });
assert.deepEqual(D.resolve({ theme: 'system' }, false).theme, 'light');
assert.deepEqual(D.resolve({ theme: 'dark', size: 'xl', contrast: true, spacing: true }, false), { theme: 'dark', size: 'xl', contrast: 'high', spacing: 'wide' });

// apply sets and removes attributes
const el = { dataset: { size: 'xl', contrast: 'high' } };
D.apply(el, D.resolve({ theme: 'light' }, false));
assert.deepEqual(el.dataset, { theme: 'light' });

// load / save round-trip, corrupt storage
const s1 = store({});
assert(D.save(s1, { theme: 'system', size: 'l', contrast: true, spacing: false, junk: 1 }));
assert.deepEqual(JSON.parse(s1.data['vm.display']), { theme: 'system', size: 'l', contrast: true, spacing: false }, 'only known fields are stored');
assert.deepEqual(D.load(s1), { theme: 'system', size: 'l', contrast: true, spacing: false });
assert.deepEqual(D.load(store({ 'vm.display': '{broken' })), D.DEFAULTS);
assert.equal(D.save({ setItem() { throw new Error('quota'); } }, D.DEFAULTS), false, 'a full storage does not throw');

// the inline boot script agrees with display.js for every combination
const cases = [
  {}, { 'vm.theme': 'dark' }, { 'vm.theme': 'light' }, { 'vm.theme': 'neon' },
  { 'vm.display': '{broken' }, { 'vm.display': '"str"' }, { 'vm.display': 'null' }, { 'vm.display': '[1]' },
  ...['system', 'light', 'dark', 'purple'].flatMap(theme => ['s', 'm', 'l', 'xl', 'huge'].flatMap(size =>
    [[false, false], [true, true], [true, false], ['true', 1]].map(([contrast, spacing]) =>
      ({ 'vm.display': JSON.stringify({ theme, size, contrast, spacing }), 'vm.theme': 'dark' }))))
];
let checked = 0;
for (const entries of cases) for (const dark of [false, true]) {
  const expected = asDataset(D.resolve(D.load(store(entries)), dark));
  assert.deepEqual(runBoot(entries, dark), expected, 'boot script = display.js for ' + JSON.stringify(entries) + ' dark=' + dark);
  checked++;
}
assert(boot.length < 600, 'the boot script stays tiny (' + boot.length + ' chars)');
console.log('✓ Display settings: normalisation, system theme, attributes; inline boot script matches display.js in ' + checked + ' cases');
