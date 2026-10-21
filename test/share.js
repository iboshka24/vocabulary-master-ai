/* Deck links: encode → decode round-trip, privacy (no SM-2 progress), and strict rejection of bad input. */
const assert = require('node:assert/strict');
const S = require('../share');
const { LANGS } = require('../ai-core');
const CODES = Object.keys(LANGS);

const rejects = async (code, expected, why) => {
  await assert.rejects(S.decodeDeck(code, CODES), e => e.code === expected, why + ' → ' + expected);
};
async function rawLink(obj) { // a link built from an arbitrary payload, bypassing payloadOf's clean-up
  const bytes = new TextEncoder().encode(typeof obj === 'string' ? obj : JSON.stringify(obj));
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  const out = new Uint8Array(await new Response(stream).arrayBuffer());
  return '1.' + Buffer.from(out).toString('base64url');
}

(async () => {
  const deck = { source: 'en', target: 'ru', cards: [
    { original: 'serendipity', translation: 'счастливая случайность', examples: ['Finding it was pure serendipity.'], hint: 'h', definition: 'd', box: 3, due: 123, ease: 2.1, interval: 9, reps: 3, lapses: 1, streak: 2, fails: 4 },
    { original: 'apple', translation: 'яблоко', examples: [] },
    { original: 'Apple', translation: 'дубль', examples: [] },          // duplicate (case-insensitive) is dropped
    { original: 'pending', translation: '—' },                          // untranslated is not shared
    { original: 'olma', translation: 'яблоко', examples: ['one', 'two', 'three'] }
  ] };
  const code = await S.encodeDeck(deck);
  assert.match(code, /^1\.[A-Za-z0-9_-]+$/, 'version prefix + base64url, safe in a URL fragment');
  const back = await S.decodeDeck(code, CODES);
  assert.deepEqual(back, { source: 'en', target: 'ru', cards: [
    { original: 'serendipity', translation: 'счастливая случайность', examples: ['Finding it was pure serendipity.'] },
    { original: 'apple', translation: 'яблоко', examples: [] },
    { original: 'olma', translation: 'яблоко', examples: ['one', 'two'] }
  ] }, 'round-trip keeps words, translations and up to two examples');
  assert(!/ease|interval|fails|due|box|reps|hint|definition/.test(JSON.stringify(S.payloadOf(deck))), 'no SM-2 progress or private notes leave the device');
  const demo = { source: 'en', target: 'ru', cards: Array.from({ length: 14 }, (_, i) => ({ original: 'word number ' + i, translation: 'слово номер ' + i, examples: ['An example sentence with word number ' + i + '.'] })) };
  const demoCode = await S.encodeDeck(demo);
  assert(demoCode.length < S.LIMITS.qrChars, 'a 14-word deck with examples fits a QR code (' + demoCode.length + ' chars)');
  await assert.rejects(S.encodeDeck({ source: 'en', target: 'ru', cards: [{ original: 'x', translation: '—' }] }), e => e.code === 'empty');

  const named = await S.decodeDeck(await S.encodeDeck({ source: 'en', target: 'ru', name: '  English  B2 ', cards: [{ original: 'apple', translation: 'яблоко', examples: [] }] }), CODES);
  assert.equal(named.name, 'English B2', 'a deck name travels with the link');
  assert.equal(JSON.stringify(S.payloadOf({ source: 'en', target: 'ru', cards: [] })).includes('"n"'), false, 'no name, no field');
  await rejects(await rawLink({ v: 1, s: 'en', t: 'ru', n: 'x'.repeat(61), c: [['a', 'b']] }), 'bad-deck', 'over-long name');
  await rejects(await rawLink({ v: 1, s: 'en', t: 'ru', n: 5, c: [['a', 'b']] }), 'bad-deck', 'non-string name');
  assert.equal(S.codeFromHash('#deck=1.abc'), '1.abc'); assert.equal(S.codeFromHash('#other'), null); assert.equal(S.codeFromHash(''), null);
  await rejects('', 'bad-link', 'empty');
  await rejects('1.', 'bad-link', 'no data');
  await rejects('1.@@@', 'bad-link', 'not base64url');
  await rejects('1.' + Buffer.from('plain text, not deflate').toString('base64url'), 'bad-link', 'not compressed');
  await rejects(await rawLink('{not json'), 'bad-link', 'not JSON');
  await rejects('2.' + code.slice(2), 'unsupported-version', 'future format');
  await rejects('1.' + 'A'.repeat(S.LIMITS.linkChars), 'too-large', 'over-long link');
  // A tiny link that inflates to megabytes is cut off during decompression.
  const bomb = await rawLink({ v: 1, s: 'en', t: 'ru', c: [['a', 'b']], pad: 'x'.repeat(5 * 1024 * 1024) });
  assert(bomb.length < S.LIMITS.linkChars, 'the bomb itself is small (' + bomb.length + ' chars)');
  await rejects(bomb, 'too-large', 'zip bomb');
  await rejects(await rawLink({ v: 1, s: 'en', t: 'ru', c: Array.from({ length: S.LIMITS.cards + 1 }, (_, i) => ['w' + i, 't']) }), 'too-large', 'too many words');
  for (const [bad, why] of [
    [{ v: 2, s: 'en', t: 'ru', c: [['a', 'b']] }, 'wrong version inside'],
    [{ v: 1, s: 'xx', t: 'ru', c: [['a', 'b']] }, 'unknown language'],
    [{ v: 1, s: 'en', t: 'en', c: [['a', 'b']] }, 'same languages'],
    [{ v: 1, s: '__proto__', t: 'ru', c: [['a', 'b']] }, 'prototype key as language'],
    [{ v: 1, s: 'en', t: 'ru', c: [] }, 'no words'],
    [{ v: 1, s: 'en', t: 'ru', c: [['a']] }, 'missing translation'],
    [{ v: 1, s: 'en', t: 'ru', c: [['a', 'b', 'e1', 'e2', 'e3']] }, 'too many examples'],
    [{ v: 1, s: 'en', t: 'ru', c: [['a', 5]] }, 'non-string field'],
    [{ v: 1, s: 'en', t: 'ru', c: [{ original: 'a', translation: 'b' }] }, 'object instead of row'],
    [{ v: 1, s: 'en', t: 'ru', c: [['   ', 'b']] }, 'blank word'],
    [{ v: 1, s: 'en', t: 'ru', c: [['a'.repeat(201), 'b']] }, 'word too long'],
    [{ v: 1, s: 'en', t: 'ru', c: [['a', 'b'.repeat(301)]] }, 'translation too long'],
    [[1, 2, 3], 'array payload']
  ]) await rejects(await rawLink(bad), 'bad-deck', why);

  // Malicious words survive only as inert text: control characters and line breaks are removed, markup is kept verbatim.
  const evil = await S.decodeDeck(await rawLink({ v: 1, s: 'en', t: 'ru', c: [['<img src=x onerror="alert(1)">', '<svg onload=alert(2)> x\u0000y', '<script>alert(3)</script>']] }), CODES);
  assert.deepEqual(evil.cards[0], { original: '<img src=x onerror="alert(1)">', translation: '<svg onload=alert(2)> x y', examples: ['<script>alert(3)</script>'] });
  assert.equal({}.s, undefined, 'no prototype pollution');
  console.log('✓ Deck links: compressed round-trip without progress, fits QR for small decks, rejects damaged/foreign/oversized/zip-bomb/malformed links, malicious text stays inert');
})().catch(e => { console.error(e); process.exitCode = 1; });
