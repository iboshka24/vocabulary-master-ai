/* Mini-game puzzles: gap position, inflections, distractors, scrambles and true/false pairs. */
const assert = require('node:assert/strict');
const G = require('../games.js');

function seeded(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const card = (original, translation, examples) => ({ original, translation, examples: examples || [] });
const deck = [
  card('to achieve', 'достигать', ['Practice helps us achieve our goals.']),
  card('journey', 'путешествие', ['Our journey across the country took three days.']),
  card('brave', 'храбрый', ['It was brave of her to speak honestly.']),
  card('to run', 'бежать', ['She was running late again.']),
  card('to notice', 'замечать', ['Nobody noticed the small mistake.']),
  card('quiet', 'тихий', ['We found a quiet place to read.']),
  card('pending', '—', ['A pending word is never asked.']),
  card('look after', 'присматривать', ['Can you look after my cat?'])
];

// findWord: exact, inflected, multi-word, and refusing look-alikes
const at = (s, w) => { const r = G.findWord(s, w); return r && s.slice(r.start, r.end); };
assert.equal(at('Practice helps us achieve our goals.', 'to achieve'), 'achieve');
assert.equal(at('She achieved it.', 'to achieve'), 'achieved', 'past tense of an -e verb');
assert.equal(at('She was running late.', 'to run'), 'running');
assert.equal(at('Nobody noticed it.', 'to notice'), 'noticed');
assert.equal(at('Two journeys later.', 'journey'), 'journeys');
assert.equal(at('Can you Look After my cat?', 'look after'), 'Look After', 'phrases match case-insensitively');
assert.equal(at('Embrave is not a word.', 'brave'), null, 'no match inside another word');
assert.equal(at('Their achievements were great.', 'to achieve'), null, 'a much longer derived word is not a gap');
assert.equal(at('Мы нашли тихий уголок.', 'тихий'), 'тихий', 'Cyrillic words work');
assert.equal(at('', 'x'), null);

// cloze: only translated words with a findable example, 4 distinct options, answer is the bare form
const qs = G.cloze(deck, 10, seeded(7));
assert(qs.length >= 6, 'every translated word with an example becomes a question (' + qs.length + ')');
for (const q of qs) {
  assert.equal(q.options.length, 4);
  assert.equal(new Set(q.options).size, 4, 'options are distinct');
  assert(q.options.includes(q.answer));
  assert(!/^to /.test(q.answer), 'the infinitive marker is dropped');
  assert.equal(q.before + q.gap + q.after, q.card.examples[0], 'the gap is cut out of the original sentence');
  assert.notEqual(q.card.translation, '—');
}
const verbQ = qs.find(q => q.card.original === 'to achieve');
assert(verbQ.options.filter(o => ['run', 'notice'].includes(o)).length === 2, 'verbs get verb distractors first');
assert.deepEqual(G.cloze(deck.slice(0, 3), 10), [], 'fewer than four words: no game');
const extra = G.cloze([card('a1', 'x1'), card('b2', 'x2'), card('c3', 'x3'), card('wonder', 'чудо')], 5, seeded(3), c => c.original === 'wonder' ? ['A small wonder.'] : []);
assert.equal(extra.length, 1, 'extra sentences (built-in context) are used when the card has none');

// scramble: single words only, a real shuffle of the same letters
const sc = G.scramble(deck, 10, seeded(11));
assert(sc.length >= 4);
for (const s of sc) {
  assert(!/\s/.test(s.word), 'phrases are skipped');
  assert.equal([...s.letters].sort().join(''), [...s.word].sort().join(''));
  assert.notEqual(s.letters.join(''), s.word, 'the word is not already spelled out');
}
assert(!sc.some(s => s.word === 'pending'), 'untranslated words are skipped');

// true/false: about half are lies, and a lie never shows the right translation
const tf = G.trueFalse(deck, 200, seeded(5));
assert.equal(tf.length, 200, 'the sprint never runs out of questions');
const lies = tf.filter(x => !x.truth);
assert(lies.length > 60 && lies.length < 140, 'roughly half are false (' + lies.length + ')');
for (const x of tf) assert.equal(x.shown === x.card.translation, x.truth);
assert.deepEqual(G.trueFalse(deck.slice(0, 2), 10), []);
// arcade rules: question stream, chests, boss hits, factory economy
const mixed = deck.concat([card('stone', 'камень'), card('candle', 'свеча')]); // two words without sentences
const stream = G.questions(mixed, 25, seeded(9), () => []);
assert.equal(stream.length, 25, 'the stream cycles through a short deck');
assert(stream.some(q => q.type === 'context') && stream.some(q => q.type === 'meaning'), 'gap-fills where a sentence exists, meaning questions elsewhere');
for (const q of stream) {
  assert.equal(q.options.length, 4); assert(q.options.includes(q.answer)); assert.equal(new Set(q.options).size, 4);
  if (q.type === 'context') assert.equal(q.before + q.gap + q.after, q.card.examples[0]); else assert.equal(q.prompt, q.card.translation);
  assert.notEqual(q.card.translation, '—');
}
assert.deepEqual(G.questions(deck.slice(0, 3), 10), [], 'fewer than four words: no arcade');
const draws = []; const r9 = seeded(21);
for (let i = 0; i < 300; i++) draws.push(...G.chests(r9));
assert(draws.every(d => G.CHESTS.includes(d)), 'every chest is one of the known outcomes');
assert(draws.filter(d => d.type === 'coins').every(d => d.value >= 100 && d.value <= 500 && d.value % 100 === 0));
assert(['coins', 'shield', 'multiplier'].every(t => draws.some(d => d.type === t)), 'all three outcomes appear');
assert.equal(G.heistPenalty(1234), 123); assert.equal(G.heistPenalty(0), 0); assert.equal(G.heistPenalty(-50), 0);
assert.deepEqual(G.bossHit(1999, true), { damage: 300, crit: true, hurt: 0 }, 'under two seconds is a critical hit');
assert.deepEqual(G.bossHit(2000, true), { damage: 100, crit: false, hurt: 0 });
assert.deepEqual(G.bossHit(9000, false), { damage: 0, crit: false, hurt: 20 }, 'a mistake or an expired question hurts the player');
let f = G.factoryDefaults();
assert.equal(G.factoryBuy(f, 'multiplier'), null, 'no tokens, no upgrade');
f.tokens = 1000;
assert.equal(G.factoryCost(f, 'multiplier'), 150);
const f1 = G.factoryBuy(f, 'multiplier');
assert.equal(f.tokens, 1000, 'buying never mutates the old state');
assert.deepEqual([f1.tokens, f1.multiplier, G.factoryCost(f1, 'multiplier')], [850, 1, 300], 'each level doubles in price');
let fm = { ...f1, tokens: 1e6 }; for (let i = 0; i < 10; i++) fm = G.factoryBuy(fm, 'multiplier') || fm;
assert.equal(fm.multiplier, 5, 'the multiplier stops at level 5'); assert.equal(G.factoryCost(fm, 'multiplier'), null); assert.equal(G.factoryBuy(fm, 'multiplier'), null);
assert.equal(G.factoryBuy({ ...f, tokens: 399 }, 'autohint'), null); assert.equal(G.factoryBuy({ ...f, tokens: 400 }, 'autohint').autohint, 1);
assert.equal(G.factoryBuy(G.factoryBuy({ ...f, tokens: 400 }, 'autohint'), 'autohint'), null, 'auto-hint is bought once');
assert.equal(G.factoryEarn({ multiplier: 0 }, 0), 10); assert.equal(G.factoryEarn({ multiplier: 2 }, 3), 25, 'multiplier and a combo of three pay more');
assert.equal(G.factoryBuy(f, 'nonsense'), null);

// word vault status
const L = require('../learning.js'), now = 1e12;
assert.equal(L.status({ original: 'a', translation: '—' }, now), 'pending');
assert.equal(L.status({ original: 'a', translation: 'b' }, now), 'new');
assert.equal(L.status({ original: 'a', translation: 'b', reps: 2, interval: 3, due: now - 1 }, now), 'due');
assert.equal(L.status({ original: 'a', translation: 'b', reps: 2, interval: 3, due: now + 1 }, now), 'learning');
assert.equal(L.status({ original: 'a', translation: 'b', reps: 6, interval: 30, due: now + 1 }, now), 'mastered');
console.log('✓ Games: gap finding with inflections, cloze with same-kind distractors, scrambles, true/false sprint, arcade rules (questions, chests, boss hits, factory economy)');
