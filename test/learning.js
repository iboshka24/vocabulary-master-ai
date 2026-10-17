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
assert.equal(card.due, 100 + 600000, 'a lapse comes back in 10 minutes');
L.grade(card, true, 100); L.grade(card, true, 100);
assert.equal(card.streak, 2); assert.equal(card.interval, 6);
assert.equal(card.due, 100 + 6 * 86400000);

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

assert.equal(L.swapPairs('apple - яблоко\nhouse : дом\nserendipity'), 'яблоко - apple\nдом : house\nserendipity');
assert.equal(L.swapPairs('run - бежать, мчаться'), 'бежать, мчаться - run', 'commas inside a translation stay together');
assert.equal(L.swapPairs('cat - кошка, dog - собака'), 'кошка - cat, собака - dog');
assert.equal(L.swapPairs('1. to go - идти'), '1. идти - to go');
assert.equal(L.swapPairs(L.swapPairs('a - b\nc = d')), 'a - b\nc = d', 'swap twice is identity');

const rev = L.reverseCards([{ original: 'cat', translation: 'кошка', box: 4, fails: 3, streak: 5, due: 99 }, { original: 'x', translation: '—' }]);
assert.equal(rev.length, 1, 'untranslated cards are skipped');
assert.equal(rev[0].original, 'кошка'); assert.equal(rev[0].translation, 'cat');
assert.equal(rev[0].box, 0); assert.equal(rev[0].fails, 0);

assert.equal(L.hint('to achieve', 1), 't· a······');
assert.equal(L.hint('кошка', 2), 'ко···');
assert.equal(L.hint('бежать, мчаться', 1), 'б·····', 'hint uses the first variant only');

const pool = [{ original: 'a', translation: '1', fails: 1, due: 0 }, { original: 'b', translation: '2', fails: 3, due: 500 }, { original: 'c', translation: '3', fails: 0, due: 50 }, { original: 'd', translation: '—' }];
assert.deepEqual(L.pick(pool, 'hard', 100).map(c => c.original), ['b', 'a']);
assert.deepEqual(L.pick(pool, 'due', 100).map(c => c.original), ['a', 'c']);
assert.equal(L.pick(pool, 'all').length, 3);

const act = L.activity({ '2026-10-17': { answers: 4, correct: 3 }, '2026-09-30': { answers: 2 } }, 20, '2026-10-17');
assert.equal(act.length, 20);
assert.equal(act[19].date, '2026-10-17'); assert.equal(act[19].answers, 4);
assert.equal(act[2].date, '2026-09-30'); assert.equal(act[2].answers, 2, 'crosses month boundary');
console.log('✓ Swap pairs, reverse deck, hints, hard/due picks, activity calendar');

const deck = [['cat','кошка'],['dog','собака'],['cat','кот'],['house','дом'],['home','дом'],['x','—'],['same','same']].map(([original, translation]) => ({ original, translation }));
const mp = L.pairs(deck, 6, () => 0.5);
const texts = mp.flatMap(c => [c.original, c.translation]);
assert.equal(new Set(texts).size, texts.length, 'matching tiles never repeat a text');
assert(!mp.some(c => c.translation === '—' || c.original === 'same'));
assert.equal(mp.length, 3, 'duplicate words or translations are skipped');
assert.equal(L.pairs(deck, 2).length, 2);
assert.deepEqual(L.pick([{ original: 'a', translation: '1', due: 90 }, { original: 'b', translation: '2', due: 10 }], 'due', 100).map(c => c.original), ['b', 'a'], 'most overdue first');
console.log('✓ Matching pairs are unique; due words come most-overdue first');

// SM-2 schedule: 1 → 6 → interval × ease; hard/easy shift both the interval and the ease.
const DAY = 86400000;
const run = ratings => ratings.reduce((c, r) => L.schedule(c, r, 0), {});
assert.deepEqual([1, 2, 3, 4].map(n => run(Array(n).fill('good')).interval), [1, 6, 15, 38]);
assert.equal(run(['good', 'good', 'good']).ease, 2.5, 'good keeps the ease');
assert.equal(run(['easy']).interval, 4);
assert.equal(run(['easy', 'easy']).interval, 8);
assert.equal(run(['easy', 'easy', 'easy']).interval, 29, '8 × 2.8 × 1.3');
assert.equal(run(['hard']).interval, 1);
assert.equal(run(['hard', 'hard']).interval, 3);
assert.equal(run(['good', 'good', 'hard']).interval, 7, 'hard: 6 × 1.2');
assert.equal(run(Array(10).fill('hard')).ease, 1.3, 'ease never drops below 1.3');
const lapsed = run(['good', 'good', 'good', 'again']);
assert.equal(lapsed.interval, 0); assert.equal(lapsed.reps, 0); assert.equal(lapsed.lapses, 1); assert.equal(lapsed.box, 0);
assert.equal(lapsed.ease, 1.96, 'a lapse (q=1) costs 0.54 ease, as in SM-2');
assert.equal(L.schedule(lapsed, 'good', 0).interval, 1, 'relearning restarts at 1 day');
const order = ['hard', 'good', 'easy'].map(r => run(['good', 'good', r]).interval);
assert(order[0] < order[1] && order[1] < order[2], 'hard < good < easy');
const long = run(Array(30).fill('easy'));
assert.equal(long.interval, 3650, 'intervals are capped at 10 years');
const legacy = L.schedule({ box: 4 }, 'good', 0);
assert.equal(legacy.interval, 18, 'pre-v2.7 box 4 (7 days) continues from 7 × 2.5');
assert.equal(legacy.due, 18 * DAY);
assert.throws(() => L.schedule({}, 'perfect'));
console.log('✓ SM-2 schedule: intervals, ease bounds, lapses, hard/good/easy ordering, legacy boxes');
