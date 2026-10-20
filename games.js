/* Mini-games over the user's own words: "word in context" (pick the word that fills the gap),
   "build the word" (letters in order) and "true or false" (60-second sprint).
   The puzzle builders are pure and tested in Node (test/games.js); mount() draws the games screen. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VMGames = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  function norm(s) { return String(s || '').toLocaleLowerCase().normalize('NFC').replace(/ё/g, 'е').replace(/\s+/g, ' ').trim(); }
  function shuffle(list, rand) {
    var r = rand || Math.random, a = list.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function usable(c) { return c && typeof c.original === 'string' && c.original.trim() && c.translation && c.translation !== '—'; }
  // "to achieve" is shown and answered as "achieve": the infinitive marker never fits a gap.
  function base(word) { return String(word || '').trim().replace(/^to\s+/i, ''); }
  function isVerb(c) { return /^to\s+/i.test(String(c.original || '').trim()); }
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // Where the word (or a simple inflection of it: achieved, journeys, running) sits in a sentence.
  function findWord(sentence, word) {
    var text = String(sentence || ''), b = base(word);
    if (!b || !text) return null;
    if (/\s/.test(b)) {
      var i = text.toLocaleLowerCase().indexOf(b.toLocaleLowerCase());
      return i < 0 ? null : { start: i, end: i + b.length };
    }
    var stem = b.length > 4 && /e$/i.test(b) ? b.slice(0, -1) : b;
    var re;
    try { re = new RegExp('(^|[^\\p{L}])(' + esc(stem) + '\\p{L}*)', 'iu'); } catch (e) { return null; }
    var m = re.exec(text);
    if (!m || m[2].length > b.length + 4) return null;
    var start = m.index + m[1].length;
    return { start: start, end: start + m[2].length };
  }

  // Up to `n` other words as wrong options: different spelling and meaning, same kind first (verbs with verbs).
  function distractors(card, pool, n, rand) {
    var seen = Object.create(null);
    seen[norm(base(card.original))] = true;
    var others = shuffle(pool, rand).filter(function (o) {
      var k = norm(base(o.original));
      if (seen[k] || norm(o.translation) === norm(card.translation)) return false;
      seen[k] = true; return true;
    });
    var same = others.filter(function (o) { return isVerb(o) === isVerb(card); });
    var rest = others.filter(function (o) { return isVerb(o) !== isVerb(card); });
    return same.concat(rest).slice(0, n);
  }

  // Gap-fill questions from the card's own examples (or extra sentences from `more(card)`).
  function cloze(cards, count, rand, more) {
    var pool = (cards || []).filter(usable);
    if (pool.length < 4) return [];
    var out = [];
    shuffle(pool, rand).forEach(function (c) {
      if (out.length >= (count || 10)) return;
      var sentences = (c.examples || []).concat(more ? more(c) || [] : []);
      for (var i = 0; i < sentences.length; i++) {
        var at = findWord(sentences[i], c.original);
        if (!at) continue;
        var wrong = distractors(c, pool, 3, rand);
        if (wrong.length < 3) return;
        out.push({
          card: c, before: sentences[i].slice(0, at.start), gap: sentences[i].slice(at.start, at.end), after: sentences[i].slice(at.end),
          answer: base(c.original), options: shuffle([base(c.original)].concat(wrong.map(function (o) { return base(o.original); })), rand)
        });
        return;
      }
    });
    return out;
  }

  // Single words of 3-12 letters, letters shuffled so the word is not already spelled out.
  function scramble(cards, count, rand) {
    var out = [], seen = Object.create(null);
    shuffle((cards || []).filter(usable), rand).forEach(function (c) {
      var w = base(c.original);
      if (out.length >= (count || 8) || seen[norm(w)] || !/^[\p{L}'-]{3,12}$/u.test(w)) return;
      seen[norm(w)] = true;
      var letters = Array.from(w), tries = 0, mixed = letters;
      while (tries++ < 12 && mixed.join('') === w) mixed = shuffle(letters, rand);
      if (mixed.join('').toLocaleLowerCase() === w.toLocaleLowerCase() && new Set(letters.map(function (x) { return x.toLocaleLowerCase(); })).size > 1) return;
      out.push({ card: c, word: w, letters: mixed });
    });
    return out;
  }

  // Word + translation pairs; about half of them show another word's translation.
  function trueFalse(cards, count, rand) {
    var r = rand || Math.random, pool = (cards || []).filter(usable);
    if (pool.length < 4) return [];
    var out = [], list = [];
    while (list.length < (count || 40)) list = list.concat(shuffle(pool, r));
    list.slice(0, count || 40).forEach(function (c) {
      var truth = r() < 0.5, shown = c.translation;
      if (!truth) {
        var other = shuffle(pool, r).find(function (o) { return norm(o.translation) !== norm(c.translation); });
        if (other) shown = other.translation; else truth = true;
      }
      out.push({ card: c, shown: shown, truth: truth });
    });
    return out;
  }

  /* ---------------- screen ---------------- */

  var ROUNDS = { context: 10, scramble: 8, truefalse: 60 }; // truefalse: seconds
  function mount(api) {
    var doc = document, $ = function (id) { return doc.getElementById(id); };
    var game = null, timer = null;
    function el(tag, cls, text) { var n = doc.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
    function deck() { return api.decks()[$('gameDeck').value]; }
    function best(kind) { try { return JSON.parse(localStorage.getItem('vm.game-best') || '{}')[kind] || 0; } catch (e) { return 0; } }
    function saveBest(kind, score) {
      try { var b = JSON.parse(localStorage.getItem('vm.game-best') || '{}'); if (score > (b[kind] || 0)) { b[kind] = score; localStorage.setItem('vm.game-best', JSON.stringify(b)); return true; } } catch (e) {}
      return false;
    }

    function fillDecks() {
      var sel = $('gameDeck'), keep = sel.value, decks = api.decks(), keys = Object.keys(decks);
      sel.innerHTML = '';
      keys.sort(function (a, b) { return decks[b].cards.length - decks[a].cards.length; }).forEach(function (k) {
        var d = decks[k], o = el('option', null, api.langLabel(d.source) + ' → ' + api.langLabel(d.target) + ' · ' + api.trn('words.count', d.cards.length));
        o.value = k; sel.appendChild(o);
      });
      if (keys.indexOf(keep) >= 0) sel.value = keep;
      $('gamesEmpty').hidden = keys.length > 0;
      $('gamesHub').hidden = !keys.length;
      document.querySelectorAll('#gamesHub [data-game]').forEach(function (b) {
        var k = b.dataset.game, rec = b.querySelector('.game-best');
        if (rec) rec.textContent = best(k) ? api.tr('game.best', { n: best(k) }) : '';
      });
    }
    function stop() { clearInterval(timer); timer = null; doc.removeEventListener('keydown', onKey); }
    function leave() { stop(); game = null; $('gameStage').hidden = true; $('gamesHub').hidden = false; $('gamesPick').hidden = false; fillDecks(); }

    function start(kind) {
      if (kind === 'match') { api.openMatch($('gameDeck').value); return; }
      var d = deck();
      if (!d) { api.toast(api.tr('toast.createDeck'), 'err'); return; }
      var items = kind === 'context' ? cloze(d.cards, ROUNDS.context, null, api.moreSentences(d))
        : kind === 'scramble' ? scramble(d.cards, ROUNDS.scramble) : trueFalse(d.cards, 200);
      if (!items.length) { api.toast(api.tr(kind === 'context' ? 'game.needExamples' : kind === 'scramble' ? 'game.needWords' : 'toast.needMatch'), 'err', 5000); return; }
      stop();
      game = { kind: kind, items: items, i: 0, score: 0, answered: 0, deck: d, ends: kind === 'truefalse' ? Date.now() + ROUNDS.truefalse * 1000 : 0 };
      $('gamesHub').hidden = true; $('gamesPick').hidden = true; $('gameStage').hidden = false;
      $('gameTitle').textContent = api.tr('game.' + kind);
      doc.addEventListener('keydown', onKey);
      if (game.ends) timer = setInterval(tick, 250);
      render();
    }
    function tick() {
      if (!game) return stop();
      var left = Math.max(0, Math.ceil((game.ends - Date.now()) / 1000));
      $('gameProgress').textContent = api.tr('game.timeLeft', { s: left });
      $('gameBar').style.width = (left / ROUNDS.truefalse * 100) + '%';
      if (left <= 0) finish();
    }
    function header() {
      $('gameScore').textContent = api.tr('game.score', { n: game.score });
      if (game.kind === 'truefalse') { tick(); return; }
      $('gameProgress').textContent = api.tr('quiz.progress', { i: game.i + 1, n: game.items.length });
      $('gameBar').style.width = (game.i / game.items.length * 100) + '%';
    }
    function render() {
      header();
      var body = $('gameBody'); body.innerHTML = ''; $('gameFeedback').textContent = ''; $('gameNext').hidden = true;
      var q = game.items[game.i];
      if (game.kind === 'context') renderContext(body, q);
      else if (game.kind === 'scramble') renderScramble(body, q);
      else renderTrueFalse(body, q);
    }
    function next() {
      if (!game) return;
      game.i++;
      if (game.i >= game.items.length) finish(); else render();
    }
    function answered(q, ok, feedback, grade) {
      game.answered++; if (ok) game.score++;
      api.answer(q.card, ok, grade);
      $('gameFeedback').textContent = feedback;
      $('gameFeedback').className = 'game-feedback ' + (ok ? 'ok' : 'bad');
      $('gameScore').textContent = api.tr('game.score', { n: game.score });
    }

    function renderContext(body, q) {
      var card = el('div', 'context-card');
      var p = el('p', 'context-sentence'); p.lang = game.deck.source;
      p.appendChild(doc.createTextNode(q.before));
      var gap = el('span', 'context-gap', '_____'); gap.setAttribute('aria-label', api.tr('game.gap'));
      p.appendChild(gap); p.appendChild(doc.createTextNode(q.after));
      card.appendChild(el('span', 'eyebrow', api.tr('game.contextAsk')));
      card.appendChild(p);
      body.appendChild(card);
      var opts = el('div', 'quiz-options game-options');
      q.options.forEach(function (o, idx) {
        var b = el('button', 'quiz-option', (idx + 1) + '.  ' + o); b.type = 'button'; b.lang = game.deck.source; b.dataset.value = o;
        b.onclick = function () {
          if (game.done) return;
          game.done = true;
          var ok = o === q.answer;
          opts.querySelectorAll('button').forEach(function (x) { x.disabled = true; if (x.dataset.value === q.answer) x.classList.add('correct'); });
          if (!ok) b.classList.add('wrong');
          gap.textContent = q.gap; gap.classList.add(ok ? 'filled-ok' : 'filled-bad');
          answered(q, ok, (ok ? api.tr('quiz.correct') : api.tr('quiz.answerWas')) + q.answer + ' — ' + q.card.translation, true);
          showNext();
        };
        opts.appendChild(b);
      });
      game.done = false;
      body.appendChild(opts);
      var first = opts.querySelector('button'); if (first) first.focus({ preventScroll: true });
    }

    function renderScramble(body, q) {
      game.typed = []; game.done = false;
      body.appendChild(el('p', 'scramble-clue', api.tr('game.scrambleAsk', { t: q.card.translation })));
      var slots = el('div', 'scramble-slots'); slots.id = 'scrambleSlots'; slots.setAttribute('aria-live', 'polite'); slots.lang = game.deck.source;
      var tiles = el('div', 'scramble-tiles');
      q.letters.forEach(function (ch, idx) {
        var b = el('button', 'letter-tile', ch); b.type = 'button'; b.dataset.idx = idx; b.lang = game.deck.source;
        b.onclick = function () { pickLetter(q, idx); };
        tiles.appendChild(b);
      });
      var tools = el('div', 'row-gap');
      var undo = el('button', 'chip-btn', api.tr('game.erase')); undo.type = 'button'; undo.onclick = function () { eraseLetter(q); };
      var skip = el('button', 'chip-btn', api.tr('game.giveUp')); skip.type = 'button'; skip.onclick = function () { revealScramble(q, false); };
      tools.appendChild(undo); tools.appendChild(skip);
      body.appendChild(slots); body.appendChild(tiles); body.appendChild(tools);
      drawSlots(q);
    }
    function drawSlots(q) {
      var slots = $('scrambleSlots'); if (!slots) return;
      slots.innerHTML = '';
      for (var i = 0; i < q.letters.length; i++) slots.appendChild(el('span', 'slot' + (game.typed[i] != null ? ' on' : ''), game.typed[i] != null ? q.letters[game.typed[i]] : ''));
      document.querySelectorAll('.letter-tile').forEach(function (b) { b.disabled = game.done || game.typed.indexOf(Number(b.dataset.idx)) >= 0; });
    }
    function pickLetter(q, idx) {
      if (game.done || game.typed.indexOf(idx) >= 0) return;
      game.typed.push(idx); drawSlots(q);
      if (game.typed.length === q.letters.length) {
        var word = game.typed.map(function (i) { return q.letters[i]; }).join('');
        if (norm(word) === norm(q.word)) revealScramble(q, true);
        else { $('gameFeedback').textContent = api.tr('game.notQuite'); $('gameFeedback').className = 'game-feedback bad'; api.sound(false); }
      }
    }
    function eraseLetter(q) { if (!game.done && game.typed.length) { game.typed.pop(); drawSlots(q); $('gameFeedback').textContent = ''; } }
    function revealScramble(q, ok) {
      if (game.done) return;
      game.done = true;
      game.typed = Array.from(q.word).map(function (ch, i) { return i; });
      q.letters = Array.from(q.word);
      drawSlots(q);
      answered(q, ok, (ok ? api.tr('quiz.correct') : api.tr('quiz.answerWas')) + q.word + ' — ' + q.card.translation, true);
      showNext();
    }

    function renderTrueFalse(body, q) {
      game.done = false;
      var card = el('div', 'tf-card');
      var w = el('strong', 'tf-word', q.card.original); w.lang = game.deck.source;
      var t = el('span', 'tf-trans', q.shown); t.lang = game.deck.target;
      card.appendChild(w); card.appendChild(el('span', 'tf-eq', '=')); card.appendChild(t);
      body.appendChild(card);
      var row = el('div', 'tf-buttons');
      var no = el('button', 'btn danger big', api.tr('game.false')); no.type = 'button'; no.onclick = function () { judge(q, false); };
      var yes = el('button', 'btn success big', api.tr('game.true')); yes.type = 'button'; yes.onclick = function () { judge(q, true); };
      row.appendChild(no); row.appendChild(yes);
      body.appendChild(row);
      body.appendChild(el('p', 'mini', api.tr('game.tfKeys')));
    }
    function judge(q, said) {
      if (!game || game.done) return;
      game.done = true;
      var ok = said === q.truth;
      answered(q, ok, ok ? api.tr('quiz.correct').trim() : api.tr('game.tfWrong', { w: q.card.original, t: q.card.translation }), false);
      api.sound(ok);
      setTimeout(next, ok ? 250 : 900);
    }

    function showNext() {
      $('gameNext').hidden = false;
      $('gameNext').textContent = api.tr(game.i + 1 >= game.items.length ? 'game.finish' : 'btn.next');
      $('gameNext').focus({ preventScroll: true });
    }
    function finish() {
      if (!game) return;
      stop();
      var g = game; g.finished = true;
      var record = saveBest(g.kind, g.score);
      api.complete();
      var body = $('gameBody'); body.innerHTML = '';
      $('gameBar').style.width = '100%';
      $('gameProgress').textContent = api.tr('game.over');
      var res = el('div', 'game-result');
      res.appendChild(el('strong', 'game-result-score', g.kind === 'truefalse' ? String(g.score) : g.score + ' / ' + g.items.length));
      res.appendChild(el('p', null, g.kind === 'truefalse' ? api.tr('game.tfResult', { n: g.score, a: g.answered }) : api.tr('game.result', { n: g.score, t: g.items.length })));
      if (record && g.score) res.appendChild(el('p', 'game-record', api.tr('game.record')));
      var row = el('div', 'row-gap');
      var again = el('button', 'btn primary', api.tr('game.again')); again.type = 'button'; again.onclick = function () { start(g.kind); };
      var back = el('button', 'btn', api.tr('game.back')); back.type = 'button'; back.onclick = leave;
      row.appendChild(again); row.appendChild(back); res.appendChild(row);
      body.appendChild(res);
      $('gameFeedback').textContent = ''; $('gameNext').hidden = true;
      again.focus({ preventScroll: true });
      game = null;
    }

    function onKey(e) {
      if (!game || e.altKey || e.ctrlKey || e.metaKey || e.target.matches('input,textarea,select')) return;
      if (e.key === 'Escape') { e.preventDefault(); leave(); return; }
      if (game.kind === 'truefalse') {
        if (e.key === 'ArrowLeft') { e.preventDefault(); judge(game.items[game.i], false); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); judge(game.items[game.i], true); }
        return;
      }
      if (e.key === 'Enter' && !$('gameNext').hidden && e.target === doc.body) { e.preventDefault(); next(); return; }
      var q = game.items[game.i];
      if (game.kind === 'context' && /^[1-4]$/.test(e.key) && !game.done) {
        var b = $('gameBody').querySelectorAll('.quiz-option')[Number(e.key) - 1]; if (b) { e.preventDefault(); b.click(); }
      } else if (game.kind === 'scramble' && !game.done) {
        if (e.key === 'Backspace') { e.preventDefault(); eraseLetter(q); return; }
        if (e.key.length !== 1) return;
        var idx = q.letters.findIndex(function (ch, i) { return game.typed.indexOf(i) < 0 && ch.toLocaleLowerCase() === e.key.toLocaleLowerCase(); });
        if (idx >= 0) { e.preventDefault(); pickLetter(q, idx); }
      }
    }

    $('gamesHub').addEventListener('click', function (e) { var b = e.target.closest('[data-game]'); if (b) start(b.dataset.game); });
    $('gameNext').onclick = next;
    $('gameQuit').onclick = leave;
    return { refresh: function () { if (!game) fillDecks(); }, leave: function () { if (game) leave(); }, active: function () { return Boolean(game); } };
  }

  return { findWord: findWord, cloze: cloze, scramble: scramble, trueFalse: trueFalse, base: base, mount: mount };
});
