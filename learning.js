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
  var PAIR = /^([^\s:=].*?)(\s*(?:[:=]|\s+[-—–]\s+|\t+)\s*)(.+)$/;
  var MULTI = /,\s*(?=[^\s,]+(?:\s+[^\s,]+)*\s*(?:[:=]|\s+[-—–]\s+|\t+)\s*)/;
  // Flip "word - перевод" into "перевод - word"; single words stay as they are.
  function swapPairs(text) {
    return String(text || '').split(/\r?\n/).map(function (line) {
      var m = line.match(/^(\s*(?:[-*•–—]|\d+[.)])*\s*)(.*)$/);
      return m[1] + m[2].split(MULTI).map(function (part) {
        var p = part.match(PAIR);
        return p ? p[3].trim() + p[2] + p[1].trim() : part;
      }).join(', ');
    }).join('\n');
  }
  // A reversed deck is a new skill: progress starts from zero.
  function reverseCards(cards) {
    return (cards || []).filter(function (c) { return c.translation && c.translation !== '—'; }).map(function (c) {
      return { original: c.translation, translation: c.original, hint: c.hint || '', definition: c.definition || '', examples: (c.examples || []).slice(), streak: 0, fails: 0, box: 0, due: 0 };
    });
  }
  // level 1 shows the first letter of every word, each next level one more.
  function hint(answer, level) {
    var n = Math.max(1, level || 1);
    return String(answer || '').split(/\s*[/,;]\s*/)[0].replace(/[\p{L}\p{N}]+/gu, function (w) {
      var chars = Array.from(w);
      return chars.map(function (ch, i) { return i < n ? ch : '·'; }).join('');
    });
  }
  function pick(cards, mode, now) {
    var t = now || Date.now();
    var ready = (cards || []).filter(function (c) { return c.translation && c.translation !== '—'; });
    if (mode === 'hard') return ready.filter(function (c) { return (c.fails || 0) > 0; }).sort(function (a, b) { return (b.fails || 0) - (a.fails || 0); });
    if (mode === 'due') return ready.filter(function (c) { return !c.due || c.due <= t; }).sort(function (a, b) { return (a.due || 0) - (b.due || 0); });
    return ready;
  }
  // Up to n cards for the matching game; no two tiles may share a text.
  function pairs(cards, n, random) {
    var rand = random || Math.random, list = (cards || []).filter(function (c) { return c.translation && c.translation !== '—'; }).slice();
    for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var x = list[i]; list[i] = list[j]; list[j] = x; }
    var seen = {}, out = [];
    list.forEach(function (c) {
      var a = normalize(c.original), b = normalize(c.translation);
      if (out.length >= n || seen[a] || seen[b] || a === b) return;
      seen[a] = seen[b] = true; out.push(c);
    });
    return out;
  }
  // Last `days` calendar days ending today, oldest first.
  function activity(history, days, today) {
    var p = (today || day()).split('-').map(Number), out = [];
    for (var i = days - 1; i >= 0; i--) {
      var key = day(new Date(p[0], p[1] - 1, p[2] - i));
      var h = (history || {})[key] || {};
      out.push({ date: key, answers: h.answers || 0, correct: h.correct || 0 });
    }
    return out;
  }
  return { day: day, gap: gap, reconcile: reconcile, complete: complete, validate: validate, grade: grade, quiz: quiz, swapPairs: swapPairs, reverseCards: reverseCards, hint: hint, pick: pick, pairs: pairs, activity: activity };
});
