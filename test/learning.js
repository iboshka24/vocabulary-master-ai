const assert = require('node:assert/strict');
const L = require('../learning');

assert.equal(L.validate('car', 'cat'), false);
assert.equal(L.validate('', 'water'), false);
assert.equal(L.validate(' WATER ', 'water'), true);
assert.equal(L.validate('remember', 'to remember'), true);
assert.equal(L.validate('бежать', 'бежать, мчаться'), true);
assert.equal(L.validate('remembr', 'remember'), true);
assert.equal(L.validate('eau', 'eaux'), false);
assert.equal(L.gap('2026-03-07', '2026-03-09'), 2);

let s = { count: 5, last: '2026-10-15', freezes: 2, enabled: true };
L.reconcile(s, '2026-10-17');
assert.equal(s.freezes, 1);
L.reconcile(s, '2026-10-17');
assert.equal(s.freezes, 1, 'reload cannot consume a second freeze');
L.reconcile(s, '2026-10-18');
assert.equal(s.freezes, 0, 'one more missed day spends exactly one more freeze');
L.complete(s, '2026-10-18');
assert.equal(s.count, 6);
L.complete(s, '2026-10-18');
assert.equal(s.count, 6, 'streak increments at most once per calendar day');
L.reconcile(s, '2026-10-20');
assert.equal(s.count, 0);
L.complete(s, '2026-10-20');
assert.equal(s.count, 1);
let disabled = { count: 4, last: '2026-10-15', freezes: 2, enabled: false };
L.reconcile(disabled, '2026-10-17');
assert.equal(disabled.count, 0);
assert.equal(disabled.freezes, 2);

const card = { streak: 0, fails: 0 };
L.grade(card, false, 100);
assert.equal(card.fails, 1); assert.equal(card.box, 0);
L.grade(card, true, 100); L.grade(card, true, 100);
assert.equal(card.box, 2); assert.equal(card.streak, 2);
assert.equal(card.due, 86400100);

const words = ['apple','house','book','water','cat'].map((original, i) => ({original, translation: 'translation ' + i}));
words[0].examples = ['She ate an apple at lunch.'];
const qs = L.quiz(words, 5);
assert.equal(qs.length, 5);
for (const q of qs) {
  assert.equal(q.options.length, 4);
  assert.equal(new Set(q.options).size, 4);
  assert(q.options.includes(q.card.original));
}
assert(qs.find(q => q.card.original === 'apple').sentence.includes('_____'));
assert.equal(L.quiz(words.slice(0,3), 5).length, 0);
console.log('✓ Learning rules: typing, freeze/reload/calendar, SRS, unique lexical distractors');
