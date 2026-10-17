/* Pure learning rules, shared by the browser and Node tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VMLearning = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  function day(date) {
    var d = date || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function gap(a, b) {
    function utc(s) { var p = s.split('-').map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); }
    return Math.round((utc(b) - utc(a)) / 86400000);
  }
  function reconcile(s, today) {
    if (!s.last || gap(s.last, today) <= 1) return s;
    if (s.checked === today) return s;
    var boundary = s.protectedThrough || s.last;
    var missed = gap(boundary, today) - (s.protectedThrough ? 0 : 1);
    if (missed <= 0) return s;
    if (s.enabled && s.freezes >= missed) {
      s.freezes -= missed;
      s.protectedThrough = today;
    } else { s.count = 0; s.last = null; s.protectedThrough = null; }
    // Advance the reconciliation boundary, not the practice date. Prevent a
    // second reload (or a second missed day) from spending the same freeze.
    s.checked = today;
    return s;
  }
  function complete(s, today) {
    reconcile(s, today);
    if (s.last === today) return false;
    s.count = s.last && (gap(s.last, today) === 1 || s.protectedThrough === today) ? s.count + 1 : 1;
    s.last = today; s.checked = today; s.protectedThrough = null;
    return true;
  }
  function normalize(s) {
    return String(s || '').toLocaleLowerCase().normalize('NFC').replace(/ё/g, 'е').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  }
  function distance(a, b) {
    var row = Array.from({ length: b.length + 1 }, function (_, i) { return i; });
    for (var i = 1; i <= a.length; i++) {
      var prev = row[0]; row[0] = i;
      for (var j = 1; j <= b.length; j++) {
        var old = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = old;
      }
    }
    return row[b.length];
  }
  function validate(input, expected) {
    var a = normalize(input).replace(/^to /, '');
    if (!a) return false;
    return String(expected || '').split(/\s*[/,;]\s*/).some(function (v) {
      var b = normalize(v).replace(/^to /, '');
      // Short words must match exactly: "cat" must never accept "car".
      return a === b || (b.length >= 6 && distance(a, b) <= 1);
    });
  }
  function grade(card, ok, now) {
    card.streak = ok ? (card.streak || 0) + 1 : 0;
    card.fails = (card.fails || 0) + (ok ? 0 : 1);
    card.box = ok ? Math.min(5, (card.box || 0) + 1) : 0;
    card.due = (now || Date.now()) + [0, 14400000, 86400000, 259200000, 604800000, 1814400000][card.box];
  }
  function quiz(cards, count, random) {
    var rand = random || Math.random;
    function shuffle(list) {
      list = list.slice();
      for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var t = list[i]; list[i] = list[j]; list[j] = t; }
      return list;
    }
    var words = cards.filter(function (c) { return c.translation && c.translation !== '—'; });
    return shuffle(words).map(function (c) {
      var seen = {}; seen[normalize(c.original)] = true;
      var others = shuffle(words).filter(function (w) {
        var k = normalize(w.original);
        if (seen[k] || normalize(w.translation) === normalize(c.translation)) return false;
        seen[k] = true; return true;
      }).slice(0, 3);
      if (others.length < 3) return null;
      var base = c.original.replace(/^to /i, '');
      var ex = (c.examples || []).find(function (s) { return normalize(s).includes(normalize(base)); });
      var sentence = ex ? ex.replace(new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '_____') : null;
      return { card: c, sentence: sentence, options: shuffle([c.original].concat(others.map(function (o) { return o.original; }))) };
    }).filter(Boolean).slice(0, count || 5);
  }
  return { day: day, gap: gap, reconcile: reconcile, complete: complete, validate: validate, grade: grade, quiz: quiz };
});
