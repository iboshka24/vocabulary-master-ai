/* Vocabulary Master AI — evolved from WordLoop. No build step. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var L = window.VMLearning;
  var I18N = window.VMI18n;
  function tr(key, vars) { return I18N ? I18N.t(key, vars) : key; }
  function trn(key, n, vars) { return I18N ? I18N.tn(key, n, vars) : String(n); }

  var LANGS = [
    { code: 'ru', label: 'Русский', en: 'Russian', voice: 'ru-RU' },
    { code: 'uz', label: "O'zbekcha", en: 'Uzbek', voice: 'uz-UZ' },
    { code: 'en', label: 'English', en: 'English', voice: 'en-US' },
    { code: 'tr', label: 'Türkçe', en: 'Turkish', voice: 'tr-TR' },
    { code: 'de', label: 'Deutsch', en: 'German', voice: 'de-DE' },
    { code: 'es', label: 'Español', en: 'Spanish', voice: 'es-ES' },
    { code: 'fr', label: 'Français', en: 'French', voice: 'fr-FR' },
    { code: 'it', label: 'Italiano', en: 'Italian', voice: 'it-IT' },
    { code: 'pt', label: 'Português', en: 'Portuguese', voice: 'pt-BR' },
    { code: 'kk', label: 'Қазақша', en: 'Kazakh', voice: 'kk-KZ' },
    { code: 'az', label: 'Azərbaycanca', en: 'Azerbaijani', voice: 'az-AZ' },
    { code: 'ka', label: 'ქართული', en: 'Georgian', voice: 'ka-GE' },
    { code: 'uk', label: 'Українська', en: 'Ukrainian', voice: 'uk-UA' },
    { code: 'pl', label: 'Polski', en: 'Polish', voice: 'pl-PL' },
    { code: 'ar', label: 'العربية', en: 'Arabic', voice: 'ar-SA' },
    { code: 'fa', label: 'فارسی', en: 'Persian', voice: 'fa-IR' },
    { code: 'hi', label: 'हिन्दी', en: 'Hindi', voice: 'hi-IN' },
    { code: 'zh', label: '中文', en: 'Chinese', voice: 'zh-CN' },
    { code: 'ja', label: '日本語', en: 'Japanese', voice: 'ja-JP' },
    { code: 'ko', label: '한국어', en: 'Korean', voice: 'ko-KR' }
  ];

  var PRESETS = {
    verbs: [
      'to achieve', 'to explore', 'to overcome', 'to notice', 'to hesitate',
      'to encourage', 'to maintain', 'to struggle', 'to appreciate', 'to distinguish'
    ],
    travel: [
      'boarding pass', 'flight delay', 'customs declaration', 'luggage claim',
      'round-trip ticket', 'layover', 'seatbelt', 'emergency exit', 'currency exchange', 'shuttle bus'
    ],
    it: [
      'refactoring', 'pipeline', 'deployment', 'latency', 'concurrency',
      'deadlock', 'payload', 'dependency', 'throughput', 'endpoint'
    ],
    advanced: [
      'serendipity', 'ephemeral', 'ubiquitous', 'resilience', 'eloquent',
      'ambiguity', 'tenacious', 'profound', 'meticulous', 'pragmatic'
    ]
  };

  var BUILTIN_DICT = {
    // Presets - Verbs
    'to achieve': 'достигать', 'to explore': 'исследовать', 'to overcome': 'преодолевать',
    'to notice': 'замечать', 'to hesitate': 'колебаться', 'to encourage': 'поощрять',
    'to maintain': 'поддерживать', 'to struggle': 'бороться', 'to appreciate': 'ценить',
    'to distinguish': 'различать', 'to remember': 'помнить', 'to borrow': 'одалживать',
    'to explain': 'объяснять', 'to waste': 'тратить впустую', 'to discover': 'открывать для себя',
    'to improve': 'улучшать', 'to create': 'создавать', 'to develop': 'развивать',
    // Presets - Travel
    'boarding pass': 'посадочный талон', 'flight delay': 'задержка рейса',
    'customs declaration': 'таможенная декларация', 'luggage claim': 'выдача багажа',
    'round-trip ticket': 'билет туда и обратно', 'layover': 'пересадка',
    'seatbelt': 'ремень безопасности', 'emergency exit': 'аварийный выход',
    'currency exchange': 'обмен валюты', 'shuttle bus': 'трансферный автобус',
    // Presets - IT
    'refactoring': 'рефакторинг', 'pipeline': 'пайплайн / конвейер', 'deployment': 'развёртывание',
    'latency': 'задержка отклика', 'concurrency': 'параллелизм', 'deadlock': 'взаимная блокировка',
    'payload': 'полезная нагрузка', 'dependency': 'зависимость', 'throughput': 'пропускная способность',
    'endpoint': 'конечная точка API', 'cache': 'кэш', 'database': 'база данных',
    // Presets - Advanced
    'serendipity': 'счастливая случайность', 'ephemeral': 'мимолётный', 'ubiquitous': 'вездесущий',
    'resilience': 'стрессоустойчивость', 'eloquent': 'красноречивый', 'ambiguity': 'неоднозначность',
    'tenacious': 'упорный / цепкий', 'profound': 'глубокий / фундаментальный',
    'meticulous': 'скрупулёзный', 'pragmatic': 'прагматичный',
    // Everyday words & bidirectional
    'hello': 'привет', 'world': 'мир', 'sunshine': 'солнечный свет', 'weather': 'погода',
    'journey': 'путешествие', 'brave': 'храбрый', 'quiet': 'тихий', 'narrow': 'узкий',
    'advice': 'совет', 'deep': 'глубокий', 'apple': 'яблоко', 'house': 'дом',
    'cat': 'кошка', 'dog': 'собака', 'car': 'машина', 'book': 'книга', 'friend': 'друг',
    'water': 'вода', 'city': 'город', 'street': 'улица', 'time': 'время', 'life': 'жизнь',
    'work': 'работа', 'study': 'учёба', 'success': 'успех', 'dream': 'мечта', 'freedom': 'свобода',
    // Russian to English
    'привет': 'hello', 'мир': 'world', 'погода': 'weather', 'путешествие': 'journey',
    'храбрый': 'brave', 'тихий': 'quiet', 'достигать': 'to achieve', 'совет': 'advice',
    'яблоко': 'apple', 'дом': 'house', 'кошка': 'cat', 'собака': 'dog', 'машина': 'car',
    'книга': 'book', 'друг': 'friend', 'вода': 'water', 'город': 'city', 'успех': 'success'
  };

  var CFG_KEY = 'wordloop.cfg';
  var SESSION_KEY = 'wordloop.session';
  var SOUND_KEY = 'wordloop.sound';
  var CHUNK = 35;

  var state = {
    cfg: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', apiKey: '', target: 'ru', source: 'en', dir: 'mixed', mode: 'flashcard', simple: false },
    serverAvailable: true,
    serverHasKey: false,
    soundEnabled: true,
    cancelled: false,
    cards: [],
    roundQueue: [],
    roundTotal: 0,
    current: null,
    curSide: 'fwd',
    revealed: false,
    round: 1,
    known: 0,
    forgot: 0,
    answers: 0,
    startedAt: 0,
    elapsed: 0,
    timer: null
  };

  /* ---------------- Sound & Speech Synthesis ---------------- */

  var audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      var AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, gainVal) {
    if (!state.soundEnabled) return;
    try {
      var ctx = getAudioCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal || 0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  function playFlipSound() { playTone(340, 'sine', 0.1, 0.08); }
  function playSuccessSound() {
    playTone(523, 'triangle', 0.12, 0.12);
    setTimeout(function () { playTone(659, 'triangle', 0.2, 0.12); }, 80);
  }
  function playForgotSound() {
    playTone(240, 'sine', 0.14, 0.1);
    setTimeout(function () { playTone(180, 'sine', 0.22, 0.1); }, 70);
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    try { localStorage.setItem(SOUND_KEY, state.soundEnabled ? '1' : '0'); } catch (e) {}
    updateSoundUI();
    toast(tr(state.soundEnabled ? 'toast.soundOn' : 'toast.soundOff'), 'ok', 1400);
    if (state.soundEnabled) playSuccessSound();
  }

  var ICON_SOUND_ON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.8 5.2a9 9 0 0 1 0 13.6"/></svg>';
  var ICON_SOUND_OFF = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/></svg>';

  function updateSoundUI() {
    var b = $('btnSound');
    if (b) {
      b.innerHTML = state.soundEnabled ? ICON_SOUND_ON : ICON_SOUND_OFF;
      b.classList.toggle('active', state.soundEnabled);
      if (typeof b.setAttribute === 'function') {
        b.setAttribute('aria-label', tr(state.soundEnabled ? 'top.soundOff' : 'top.soundOn'));
      }
    }
  }

  function speakText(text, langCode) {
    if (!state.soundEnabled) return;
    if (!('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      var ut = new SpeechSynthesisUtterance(text);
      var targetLang = langByCode(langCode);
      ut.lang = (targetLang && targetLang.voice) || 'en-US';
      ut.rate = 0.95;
      window.speechSynthesis.speak(ut);
    } catch (e) {}
  }

  /* ---------------- utils ---------------- */

  function show(id) {
    var apply = function () {
      document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('active', s.id === id); });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.VMMotion) window.VMMotion.screen(id);
    };
    /* Прогрессивное улучшение: нативный cross-fade между экранами, где поддерживается */
    try {
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!window.VMMotion && !reduced && typeof document.startViewTransition === 'function') {
        document.startViewTransition(apply);
        return;
      }
    } catch (e) {}
    apply();
  }

  var toastTimer = null;
  var toastHideTimer = null;
  function toast(msg, type, ms) {
    var t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast ' + (type || '');
    t.hidden = false;
    clearTimeout(toastTimer);
    clearTimeout(toastHideTimer);
    toastTimer = setTimeout(function () {
      try { t.classList.add('out'); } catch (e) {}
      toastHideTimer = setTimeout(function () {
        t.hidden = true;
        try { t.classList.remove('out'); } catch (e) {}
      }, 280);
    }, ms || 3200);
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  }

  function chunk(arr, n) {
    var out = [];
    for (var i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  }

  function langByCode(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i];
    return LANGS[0];
  }

  function saveCfg() {
    try { localStorage.setItem(CFG_KEY, JSON.stringify(state.cfg)); } catch (e) {}
    updateApiStatus();
  }

  function loadCfg() {
    try {
      var raw = localStorage.getItem(CFG_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        Object.keys(o || {}).forEach(function (k) { if (state.cfg[k] !== undefined) state.cfg[k] = o[k]; });
      }
      var s = localStorage.getItem(SOUND_KEY);
      if (s !== null) state.soundEnabled = s === '1';
    } catch (e) {}
  }

  function saveSession() {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        cards: state.cards, dir: state.cfg.dir, source: state.cfg.source, target: state.cfg.target, round: state.round, at: Date.now()
      }));
      $('resumeBox').hidden = false;
    } catch (e) {}
  }

  /* ---------------- Cinematic FX: фон, частицы, параллакс ---------------- */

  var fxState = { raf: 0, particles: [], comets: [], w: 0, h: 0, dpr: 1, mx: 0, my: 0, lastComet: 0, ctx: null, canvas: null };

  var FX_COLORS = { amber: [255, 196, 107], violet: [167, 139, 250], white: [244, 241, 234] };

  function fxResize() {
    var c = fxState.canvas, ctx = fxState.ctx;
    if (!c || !ctx) return;
    var w = window.innerWidth || 1200;
    var h = window.innerHeight || 800;
    fxState.dpr = Math.min(2, window.devicePixelRatio || 1);
    fxState.w = w; fxState.h = h;
    c.width = Math.floor(w * fxState.dpr);
    c.height = Math.floor(h * fxState.dpr);
    ctx.setTransform(fxState.dpr, 0, 0, fxState.dpr, 0, 0);
  }

  function fxSpawnParticles() {
    var count = Math.max(28, Math.min(72, Math.round((fxState.w * fxState.h) / 26000)));
    var ps = [];
    for (var i = 0; i < count; i++) {
      var depth = 0.35 + Math.random() * 0.65; /* 0.35 — дальний план, 1 — передний */
      ps.push({
        x: Math.random() * fxState.w,
        y: Math.random() * fxState.h,
        r: 0.6 + depth * 1.9,
        depth: depth,
        vx: (Math.random() - 0.5) * 0.16 * depth,
        vy: -(0.05 + Math.random() * 0.2) * depth,
        phase: Math.random() * Math.PI * 2,
        wob: 0.25 + Math.random() * 0.55,
        a: 0.1 + Math.random() * 0.3,
        hue: Math.random() < 0.55 ? 'amber' : (Math.random() < 0.6 ? 'violet' : 'white')
      });
    }
    fxState.particles = ps;
  }

  function fxFrame(now) {
    var ctx = fxState.ctx;
    if (!ctx) return;
    var w = fxState.w, h = fxState.h;
    ctx.clearRect(0, 0, w, h);
    var t = now * 0.001;

    /* пылинки с параллаксом от курсора */
    for (var i = 0; i < fxState.particles.length; i++) {
      var p = fxState.particles[i];
      p.x += p.vx + Math.sin(t * p.wob + p.phase) * 0.14 * p.depth;
      p.y += p.vy;
      if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }
      if (p.x < -12) p.x = w + 12;
      if (p.x > w + 12) p.x = -12;

      var ox = fxState.mx * 26 * p.depth;
      var oy = fxState.my * 20 * p.depth;
      var col = FX_COLORS[p.hue] || FX_COLORS.amber;
      var alpha = p.a * (0.65 + 0.35 * Math.sin(t * 0.8 + p.phase));

      var g = ctx.createRadialGradient(p.x + ox, p.y + oy, 0, p.x + ox, p.y + oy, p.r * 4);
      g.addColorStop(0, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + alpha.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x + ox, p.y + oy, p.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    /* редкие кометы, пересекающие экран */
    if (now - fxState.lastComet > 5200 + Math.random() * 4200 && fxState.comets.length < 2) {
      fxState.lastComet = now;
      fxState.comets.push({
        x: Math.random() * w * 0.7,
        y: Math.random() * h * 0.4,
        len: 90 + Math.random() * 130,
        sp: 5.5 + Math.random() * 4,
        life: 1
      });
    }
    for (var c = fxState.comets.length - 1; c >= 0; c--) {
      var k = fxState.comets[c];
      k.x += k.sp; k.y += k.sp * 0.32; k.life -= 0.012;
      if (k.life <= 0 || k.x > w + 200) { fxState.comets.splice(c, 1); continue; }
      var lg = ctx.createLinearGradient(k.x, k.y, k.x - k.len, k.y - k.len * 0.32);
      lg.addColorStop(0, 'rgba(255,255,255,' + (0.5 * k.life).toFixed(3) + ')');
      lg.addColorStop(0.4, 'rgba(255,196,107,' + (0.26 * k.life).toFixed(3) + ')');
      lg.addColorStop(1, 'rgba(255,196,107,0)');
      ctx.strokeStyle = lg;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(k.x, k.y);
      ctx.lineTo(k.x - k.len, k.y - k.len * 0.32);
      ctx.stroke();
    }

    fxState.raf = window.requestAnimationFrame(fxFrame);
  }

  function initFX() {
    try {
      if (typeof document.createElement !== 'function') return;
      var probe = document.createElement('canvas');
      if (!probe || typeof probe.getContext !== 'function') return; /* нет canvas или мок-среда */
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var canvas = $('fx');
      if (!canvas || typeof canvas.getContext !== 'function') return;
      var ctx = canvas.getContext('2d');
      if (!ctx) return;

      fxState.canvas = canvas; fxState.ctx = ctx;
      fxResize(); fxSpawnParticles();
      fxState.raf = window.requestAnimationFrame(fxFrame);

      window.addEventListener('resize', function () { fxResize(); fxSpawnParticles(); });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          if (fxState.raf && window.cancelAnimationFrame) { window.cancelAnimationFrame(fxState.raf); fxState.raf = 0; }
        } else if (!fxState.raf) {
          fxState.raf = window.requestAnimationFrame(fxFrame);
        }
      });
    } catch (e) {}
  }

  /* Параллакс: курсор двигает аврору, 3D-орбиту и световое пятно */
  function initParallax() {
    try {
      var root = document.documentElement;
      if (!root || !root.style) return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches)) return;

      var hero = $('screen-setup');
      var spot = null;
      if (hero && typeof hero.querySelector === 'function') spot = hero.querySelector('.spot');

      var tx = 0, ty = 0, cx = 0, cy = 0, sx = 0, sy = 0, csx = 0, csy = 0;
      var running = false;

      var tick = function () {
        cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
        csx += (sx - csx) * 0.12; csy += (sy - csy) * 0.12;
        root.style.setProperty('--mx', cx.toFixed(4));
        root.style.setProperty('--my', cy.toFixed(4));
        fxState.mx = cx; fxState.my = cy;
        if (spot) spot.style.transform = 'translate3d(' + csx.toFixed(1) + 'px,' + csy.toFixed(1) + 'px,0)';
        if (Math.abs(tx - cx) < 0.001 && Math.abs(ty - cy) < 0.001 &&
            Math.abs(sx - csx) < 0.5 && Math.abs(sy - csy) < 0.5) {
          running = false; return; /* цель достигнута — цикл замирает */
        }
        window.requestAnimationFrame(tick);
      };
      var ensure = function () { if (!running) { running = true; window.requestAnimationFrame(tick); } };

      document.addEventListener('pointermove', function (e) {
        var w = window.innerWidth || 1, h = window.innerHeight || 1;
        tx = (e.clientX / w - 0.5) * 2;
        ty = (e.clientY / h - 0.5) * 2;
        if (spot && hero && typeof hero.getBoundingClientRect === 'function') {
          var r = hero.getBoundingClientRect();
          sx = e.clientX - r.left;
          sy = e.clientY - r.top;
        }
        ensure();
      }, { passive: true });
    } catch (e) {}
  }

  /* ---------------- pre-filter & pair parser ---------------- */

  function detectScript(text) {
    if (!text) return null;
    var str = String(text);
    var cyr = (str.match(/[\u0400-\u04FF]/g) || []).length;
    var lat = (str.match(/[a-zA-Z]/g) || []).length;
    if (cyr > lat && cyr >= 2) return 'ru';
    if (lat > cyr && lat >= 2) return 'en';
    return null;
  }

  function parseInput(text) {
    var rawLines = String(text || '').split(/\r?\n/);
    var seen = Object.create(null);
    var items = [];
    var dropped = 0;

    for (var i = 0; i < rawLines.length; i++) {
      var raw = rawLines[i].replace(/^\s*(?:[-*•–—]|\d+[.)])+\s*/, '').trim();
      if (!raw) continue;
      if (/^https?:\/\//i.test(raw) || /[\w.]+@[\w.]+/.test(raw) || /^\d+$/.test(raw)) {
        dropped++;
        continue;
      }

      // Check if line contains multiple pairs separated by commas: e.g. "apple - яблоко, cat - кошка"
      var subPairs = raw.split(/,\s*(?=[^\s,]+(?:\s+[^\s,]+)*\s*(?:[:=]|\s+[-—–]\s+|\t+)\s*)/);

      for (var p = 0; p < subPairs.length; p++) {
        var chunk = subPairs[p].trim();
        if (!chunk) continue;

        // Check for single pair delimiter: - — – : = \t
        var pairMatch = chunk.match(/^([^\s:=].*?)\s*(?:[:=]|\s+[-—–]\s+|\t+)\s*(.+)$/);
        if (pairMatch && pairMatch[1].trim() && pairMatch[2].trim()) {
          var orig = pairMatch[1].trim();
          var trans = pairMatch[2].trim();
          if (!/[\p{L}]/u.test(orig) || /^https?:\/\//i.test(orig) || orig.length > 180) {
            dropped++;
            continue;
          }
          var k = orig.toLowerCase();
          if (seen[k]) { dropped++; continue; }
          seen[k] = 1;
          items.push({ original: orig, translation: trans, hint: '', pretranslated: true });
        } else {
          // Line without pair delimiter: split by commas / semicolons / bullets
          var parts = chunk.split(/[,;•]+/);
          for (var j = 0; j < parts.length; j++) {
            var single = parts[j].trim();
            if (!single) continue;
            if (!/[\p{L}]/u.test(single) || /^https?:\/\//i.test(single) || /[\w.]+@[\w.]+/.test(single) || single.length > 180) {
              dropped++;
              continue;
            }
            var k2 = single.toLowerCase();
            if (seen[k2]) { dropped++; continue; }
            seen[k2] = 1;
            items.push({ original: single, translation: '', hint: '', pretranslated: false });
          }
        }
      }
    }
    return { items: items, dropped: dropped };
  }

  /* ---------------- AI & Translation ---------------- */

  function systemPrompt(targetEn) {
    return 'You are the engine of Vocabulary Master AI vocabulary trainer.\n' +
      'Input: list of words/phrases.\n' +
      'Tasks:\n' +
      '1. FILTER: drop junk, duplicates, numbers, urls, single letters. Keep useful words/phrases.\n' +
      '2. TRANSLATE every item into ' + targetEn + '.\n' +
      '3. If item is already in ' + targetEn + ', keep it unchanged.\n' +
      '4. Add "hint": a short mnemonic or memory hook (3-8 words) in ' + targetEn + ' that makes it easy to remember.\n' +
      '5. Add "definition": a concise definition in the source language (' + state.cfg.source + '), and "examples": 1-2 natural sentences in that source language containing the exact original word. Never include the translation inside an example.\n' +
      'Answer STRICT JSON only:\n' +
      '{"items":[{"original":"...","translation":"...","hint":"...","definition":"...","examples":["..."]}]}';
  }

  function numbered(items) {
    return items.map(function (x, i) { return (i + 1) + '. ' + x.original; }).join('\n');
  }

  function parseItems(text) {
    if (!text) return [];
    var t = String(text).replace(/```(?:json)?/gi, '').trim();

    function attempt(s) {
      try {
        var o = JSON.parse(s);
        if (Array.isArray(o)) return o;
        if (o && Array.isArray(o.items)) return o.items;
        if (o && Array.isArray(o.results)) return o.results;
        if (o && Array.isArray(o.data)) return o.data;
      } catch (e) {}
      return null;
    }

    var got = attempt(t);
    if (!got) {
      var i = t.indexOf('{'), j = t.lastIndexOf('}');
      if (i >= 0 && j > i) got = attempt(t.slice(i, j + 1));
    }
    if (!got) {
      var a = t.indexOf('['), b = t.lastIndexOf(']');
      if (a >= 0 && b > a) got = attempt(t.slice(a, b + 1));
    }
    if (!got) return [];

    return got
      .map(function (o) {
        if (typeof o === 'string') return { original: o, translation: '', hint: '' };
        var orig = o.original || o.word || o.source || o.text || o.ru || '';
        var trText = o.translation || o.translated || o.target || o.tr || o.en || '';
        return { original: String(orig).trim(), translation: String(trText).trim(), hint: String(o.hint || o.note || '').trim(), definition: String(o.definition || ''), examples: Array.isArray(o.examples) ? o.examples.filter(function (x) { return typeof x === 'string'; }).slice(0, 2) : [] };
      })
      .filter(function (o) { return o.original; });
  }

  function pickText(json) {
    if (json && json.text) return json.text;
    if (json && json.choices && json.choices[0] && json.choices[0].message) return json.choices[0].message.content;
    return '';
  }

  async function checkServerStatus() {
    try {
      var r = await fetch('/api/ai', { method: 'GET' });
      if (r.ok) {
        var d = await r.json();
        state.serverHasKey = Boolean(d.serverKeyConfigured);
        state.serverAvailable = true;
      } else {
        state.serverAvailable = false;
      }
    } catch (e) {
      state.serverAvailable = false;
    }
    updateApiStatus();
  }

  function updateApiStatus() {
    var ind = $('statusIndicator');
    var summ = $('apiSummaryStatus');
    if (state.serverHasKey) {
      if (ind) { ind.textContent = tr('status.server'); ind.className = 'status-indicator'; }
      if (summ) { summ.textContent = tr('summ.server'); summ.className = 'api-summary-status'; }
    } else if (state.cfg.apiKey) {
      if (ind) { ind.textContent = tr('status.browserKey'); ind.className = 'status-indicator'; }
      if (summ) { summ.textContent = tr('summ.browserKey'); summ.className = 'api-summary-status'; }
    } else {
      if (ind) { ind.textContent = tr('status.free'); ind.className = 'status-indicator warn'; }
      if (summ) { summ.textContent = tr('summ.free'); summ.className = 'api-summary-status'; }
    }
  }

  async function callAI(messages) {
    var bodyObj = {
      messages: messages,
      model: state.cfg.model,
      baseUrl: state.cfg.baseUrl,
      apiKey: state.cfg.apiKey,
      temperature: 0.2
    };

    /* 1) Прокси на Vercel (серверный ключ или проксирование браузерного ключа) */
    if (state.serverAvailable) {
      try {
        var headers = { 'Content-Type': 'application/json' };
        if (state.cfg.apiKey) {
          headers['Authorization'] = 'Bearer ' + state.cfg.apiKey;
        }
        var r = await fetch('/api/ai', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(bodyObj)
        });
        if (r.ok) {
          var j = await r.json();
          var txt = pickText(j);
          if (txt) return txt;
          throw new Error(tr('err.emptyServer'));
        }
        var err = {};
        try { err = await r.json(); } catch (e) {}
        if (r.status === 404 || r.status === 501 || err.code === 'no-key') {
          state.serverAvailable = false;
        } else {
          throw new Error(err.error || tr('err.serverStatus', { s: r.status }));
        }
      } catch (e) {
        if (e instanceof TypeError) state.serverAvailable = false;
        else throw e;
      }
    }

    /* 2) Напрямую по ключу пользователя в браузере (если прокси не доступен, e.g. локальный сервер) */
    var cfg = state.cfg;
    if (cfg.apiKey) {
      var url = String(cfg.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '') + '/chat/completions';
      var res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey },
        body: JSON.stringify({ model: cfg.model || 'gpt-4o-mini', messages: messages, temperature: 0.2 })
      });
      if (!res.ok) {
        var e2 = {};
        try { e2 = await res.json(); } catch (e) {}
        var msg = (e2.error && (e2.error.message || e2.error)) || tr('err.apiStatus', { s: res.status });
        throw new Error(typeof msg === 'string' ? msg : tr('err.apiStatus', { s: res.status }));
      }
      var data = await res.json();
      var out = pickText(data);
      if (!out) throw new Error(tr('err.emptyModel'));
      return out;
    }

    throw new Error('no-key');
  }

  /* Free translation fallback engine (MyMemory API + Local dictionary) */
  async function translateSingleFree(word, targetCode, sourceCode) {
    var source = sourceCode || state.cfg.source;
    var lower = word.toLowerCase().trim();
    var cached = readTranslationCache(lower, source, targetCode);
    if (cached) return cached;
    if (targetCode === 'ru' && source === 'en' && BUILTIN_DICT[lower]) {
      return BUILTIN_DICT[lower];
    }
    if (targetCode === 'en' && source === 'ru' && BUILTIN_DICT[lower]) {
      return BUILTIN_DICT[lower];
    }

    var isCyrillic = /[а-яё]/i.test(word);
    var srcCode = source || (isCyrillic ? 'ru' : 'en');
    var tgtCode = targetCode || (isCyrillic ? 'en' : 'ru');
    if (srcCode === tgtCode) {
      tgtCode = isCyrillic ? 'en' : 'ru';
    }

    var pairsToTry = [srcCode + '|' + tgtCode, 'autodetect|' + tgtCode];

    for (var i = 0; i < pairsToTry.length; i++) {
      try {
        var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(word) + '&langpair=' + pairsToTry[i];
        var res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          var json = await res.json();
          if (json) {
            var candidates = [];
            if (json.responseData && json.responseData.translatedText) {
              candidates.push({ text: json.responseData.translatedText.trim(), quality: Number(json.responseData.match || 0) * 100 });
            }
            if (Array.isArray(json.matches)) {
              json.matches.forEach(function (m) {
                if (m && m.translation) candidates.push({ text: m.translation.trim(), quality: Number(m.quality || 0) });
              });
            }
            candidates.sort(function (a, b) { return b.quality - a.quality; });

            for (var c = 0; c < candidates.length; c++) {
              var t = candidates[c].text;
              if (!t) continue;
              if (t.toLowerCase() === lower) continue;
              if (/PLEASE SELECT TWO|MYMEMORY WARNING|NO QUERY SPECIFIED|HTML tags/i.test(t)) continue;
              writeTranslationCache(lower, srcCode, tgtCode, t);
              return t;
            }
          }
        }
      } catch (e) {}
    }
    return '—';
  }

  async function translateBatchFree(items, targetCode) {
    var out = [];
    var total = items.length;
    for (var i = 0; i < total; i++) {
      if (state.cancelled) return null;
      var item = items[i];
      setLoad(
        Math.round(((i + 1) / total) * 100),
        tr('load.free', { i: i + 1, n: total }),
        tr('load.card', { w: item.original })
      );
      var translated = await translateSingleFree(item.original, targetCode);
      out.push({
        original: item.original,
        translation: translated,
        hint: tr('hint.assoc', { w: item.original })
      });
      // Small pause to be gentle on free API
      if (i < total - 1) await new Promise(function (r) { setTimeout(r, 70); });
    }
    return out;
  }

  function setLoad(pct, step, count) {
    $('loadBar').style.width = Math.max(4, Math.min(100, pct)) + '%';
    if (step) $('loadStep').textContent = step;
    $('loadCount').textContent = count || '';
  }

  async function buildCards(parsedItems) {
    var target = langByCode(state.cfg.target);
    var readyCards = [];
    var needTranslation = [];

    parsedItems.forEach(function (it) {
      if (it.pretranslated) readyCards.push(it);
      else needTranslation.push(it);
    });

    if (!needTranslation.length) {
      setLoad(100, tr('load.allPaired'), tr('load.ready', { n: readyCards.length }));
      await new Promise(function (r) { setTimeout(r, 200); });
      return readyCards;
    }

    // Try AI first if key exists
    var canTryAI = state.serverHasKey || Boolean(state.cfg.apiKey);
    if (canTryAI) {
      try {
        var parts = chunk(needTranslation, CHUNK);
        var aiCards = [];
        for (var i = 0; i < parts.length; i++) {
          if (state.cancelled) return null;
          setLoad(
            Math.round((i / parts.length) * 90) + 5,
            parts.length > 1 ? tr('load.aiPart', { i: i + 1, n: parts.length }) : tr('load.aiOne'),
            tr('load.processed', { a: aiCards.length, b: needTranslation.length })
          );

          var text = await callAI([
            { role: 'system', content: systemPrompt(target.en) },
            { role: 'user', content: numbered(parts[i]) }
          ]);
          var parsed = parseItems(text);
          if (parsed && parsed.length > 0) {
            // Use AI filtered and translated items directly
            for (var pIdx = 0; pIdx < parsed.length; pIdx++) {
              var pItem = parsed[pIdx];
              var translated = pItem.translation;
              if (!translated || translated === '—') {
                translated = await translateSingleFree(pItem.original, state.cfg.target);
              }
              aiCards.push({
                original: pItem.original,
                translation: translated || '—',
                hint: pItem.hint || '', definition: pItem.definition || '', examples: pItem.examples || []
              });
            }
          } else {
            // Fallback for this chunk if AI returned empty
            for (var sIdx = 0; sIdx < parts[i].length; sIdx++) {
              var src = parts[i][sIdx];
              var freeTr = await translateSingleFree(src.original, state.cfg.target);
              aiCards.push({ original: src.original, translation: freeTr, hint: '' });
            }
          }
        }
        return readyCards.concat(aiCards);
      } catch (err) {
        if (err.message !== 'no-key') {
          console.warn('AI call failed, falling back to free translator:', err);
        }
      }
    }

    // Fallback: Free translation
    toast(tr('toast.freeTr'), 'ok', 3000);
    var freeCards = await translateBatchFree(needTranslation, state.cfg.target);
    if (!freeCards) return null;
    return readyCards.concat(freeCards);
  }

  /* ---------------- demo ---------------- */

  var DEMO = [
    ['serendipity', 'счастливая случайность', 'нежданная удачная находка'],
    ['to remember', 'помнить', 're + member — «собрать в памяти»'],
    ['journey', 'путешествие', 'long trip, путь вперёд'],
    ['brave', 'храбрый', 'смелый перед опасностью'],
    ['quiet', 'тихий', 'полная тишина'],
    ['to achieve', 'достигать', 'цель + усилие = результат'],
    ['weather', 'погода', 'солнце, дождь, ветер'],
    ['to borrow', 'одалживать', 'взять взаймы и вернуть'],
    ['narrow', 'узкий', 'мало места по бокам'],
    ['to explain', 'объяснять', 'сделать кристально понятным'],
    ['resilience', 'стрессоустойчивость', 'умение держать удар и восстанавливаться'],
    ['to waste', 'тратить впустую', 'время или деньги на ветер'],
    ['deep', 'глубокий', 'дно океана или глубокая мысль'],
    ['to notice', 'замечать', 'взгляд зацепился за деталь']
  ];

  function demoCards() {
    return DEMO.map(function (d) { return { original: d[0], translation: d[1], hint: d[2] }; });
  }

  /* ---------------- training ---------------- */

  var nextCardTimer = null;

  function startTraining(cards, resume) {
    if (!cards || !cards.length) { toast(tr('toast.noWords'), 'err'); return; }

    state.cancelled = false;
    clearTimeout(nextCardTimer);
    nextCardTimer = null;

    state.cards = cards.map(function (c, i) {
      return Object.assign({}, c, { id: i, hint: c.hint || '', streak: c.streak || 0, fails: c.fails || 0 });
    });
    state.roundQueue = shuffle(state.cards.map(function (c) { return c.id; }));
    state.roundTotal = state.cards.length;
    state.current = null;
    state.previewId = null; state.previewSide = null; state.nextRoundQueue = null;
    state.revealed = false;
    state.round = resume ? (resume.round || 1) : 1;
    state.known = 0; state.forgot = 0; state.answers = 0;
    state.startedAt = Date.now(); state.elapsed = 0;
    combo = 0; undoSnap = null;
    answerLocked = false; summaryRecorded = false;
    if (L) { enrichLocalContext(state.cards); archiveCards(); }

    try {
      window.history.pushState({ screen: 'train' }, '');
    } catch (e) {}

    show('screen-train');
    $('topPill').hidden = false;
    $('topPill').textContent = trn('pill.cards', state.cards.length);
    nextCard(true);
    startTimer();
    saveSession();
    updateUndo();
    if (isListen() && (!state.soundEnabled || !('speechSynthesis' in window))) toast(tr('listen.noSound'), 'err', 4000);
    else if (!resume) toast(trn('toast.deckReady', state.cards.length), 'ok');
  }

  function nextCard(first) {
    if (state.cancelled || !state.cards || !state.cards.length) return;
    var trainScreen = $('screen-train');
    if (trainScreen && !trainScreen.classList.contains('active')) return;

    if (!state.roundQueue.length) {
      state.round++;
      // В новом раунде забытые/сложные слова идут первыми
      var sorted = state.cards.slice().sort(function (a, b) {
        return (b.fails - a.fails) || (Math.random() - 0.5);
      });
      state.roundQueue = state.nextRoundQueue || sorted.map(function (c) { return c.id; });
      state.nextRoundQueue = null;
      state.roundTotal = state.cards.length;
      toast(tr('toast.round', { n: state.round }), 'ok', 2600);
      playSuccessSound();
    }

    state.current = state.cards[state.roundQueue.shift()];
    state.revealed = false;
    answerLocked = false;

    if (isListen()) state.curSide = 'fwd';
    else if (state.cfg.dir === 'mixed') state.curSide = state.previewId === state.current.id && state.previewSide ? state.previewSide : (Math.random() < 0.5 ? 'fwd' : 'rev');
    else state.curSide = state.cfg.dir;

    renderCard();
    if (!first && !window.VMMotion) {
      var card = $('card');
      card.classList.remove('pop');
      void card.offsetWidth;
      card.classList.add('pop');
    }
    renderStats();
  }

  function renderCard() {
    var c = state.current;
    if (!c) return;
    var fwd = state.curSide === 'fwd';
    if (L) pendingTypedAnswer = null;
    state.hintLevel = 0;
    var target = langByCode(state.cfg.target);

    $('cardWord').textContent = fwd ? c.original : c.translation;
    $('cardTrans').textContent = fwd ? c.translation : c.original;
    $('cardSub').textContent = tr(fwd ? 'card.subFwd' : 'card.subRev');
    $('cardHint').textContent = state.cfg.simple ? '' : (c.hint || '');
    if (L) {
      $('cardContext').textContent = state.cfg.simple ? '' : [c.definition].concat(c.examples || []).filter(Boolean).join(' · ');
      $('sessionLanguage').textContent = langByCode(state.cfg.source).label + ' → ' + target.label;
      $('typedAnswer').value = '';
      $('answerFeedback').hidden = true;
    }
    $('cardBadge').textContent = fwd ? tr('card.original') : target.label;
    $('cardBadgeBack').textContent = fwd ? target.label : tr('card.original');
    if (isListen()) {
      $('cardWord').textContent = '🎧';
      $('cardTrans').textContent = c.original;
      $('cardSub').textContent = tr('listen.sub');
      $('cardHint').textContent = c.translation;
      $('cardBadge').textContent = tr('listen.badge');
      $('cardBadgeBack').textContent = tr('card.original');
      setTimeout(function () { if (state.current === c && !state.revealed) speakText(c.original, state.cfg.source); }, 380);
    }
    if (L) $('typedAnswer').placeholder = tr(isListen() ? 'listen.ph' : 'typing.ph');
    if (L) { cardElLabel(); announce(''); }

    var cardEl = $('card');
    cardEl.classList.remove('flipped');
    cardEl.classList.remove('exit-ok', 'exit-no', 'pop');
    if (cardEl.style) cardEl.style.transform = ''; /* сброс наклона за курсором */
    updateRows();
    if (window.VMMotion) { cardEl.dataset.revealed = 'false'; cardEl.dataset.swipe = String(state.cfg.mode === 'flashcard'); updateNextPreview(); window.VMMotion.card(); }
  }

  function updateNextPreview() {
    if (!window.VMMotion || !state.cards.length) return;
    var queue = state.roundQueue;
    if (!queue.length) {
      if (!state.nextRoundQueue) state.nextRoundQueue = state.cards.slice().sort(function (a,b) { return (b.fails-a.fails) || (Math.random()-.5); }).map(function (c) { return c.id; });
      queue = state.nextRoundQueue;
    } else state.nextRoundQueue = null;
    var id = queue[0], c = state.cards[id];
    if (!c) return;
    if (id !== state.previewId || !state.previewSide || state.cfg.dir !== 'mixed') state.previewSide = state.cfg.dir === 'mixed' ? (Math.random()<.5 ? 'fwd':'rev') : state.cfg.dir;
    state.previewId = id;
    var fwd = state.previewSide === 'fwd';
    $('nextCardWord').textContent = fwd ? c.original : c.translation;
    $('nextCardBadge').textContent = fwd ? tr('card.original') : langByCode(state.cfg.target).label;
    $('nextCardSub').textContent = tr(fwd ? 'card.subFwd' : 'card.subRev');
    if (isListen()) { $('nextCardWord').textContent = '🎧'; $('nextCardBadge').textContent = tr('listen.badge'); $('nextCardSub').textContent = tr('listen.sub'); }
  }

  function announce(text) { var el = $('srStatus'); if (el) el.textContent = text; }
  function cardElLabel() {
    var c = state.current, card = $('card');
    if (!c || !card.setAttribute) return;
    card.setAttribute('aria-label', state.revealed ? tr('a11y.cardBack', { w: $('cardWord').textContent, a: $('cardTrans').textContent }) : isListen() ? tr('a11y.cardListen') : tr('a11y.cardFront', { w: $('cardWord').textContent }));
  }
  function isListen() { return !!L && state.cfg.mode === 'listen'; }
  function isTyping() { return !!L && (state.cfg.mode === 'typing' || state.cfg.mode === 'listen'); }
  function expectedAnswer() {
    var c = state.current;
    return isListen() || state.curSide !== 'fwd' ? c.original : c.translation;
  }

  function updateRows() {
    var rowH = $('rowHidden');
    var rowS = $('rowShown');
    if (rowH) {
      rowH.hidden = state.revealed;
      rowH.style.display = state.revealed ? 'none' : '';
    }
    if (rowS) {
      rowS.hidden = !state.revealed;
      rowS.style.display = !state.revealed ? 'none' : '';
    }
    if (isTyping()) {
      rowH.hidden = true; rowS.hidden = true;
      $('typingForm').hidden = state.revealed;
      if (!state.revealed) setTimeout(function () { if ($('screen-train').classList.contains('active')) $('typedAnswer').focus(); }, 200);
    } else if (L) $('typingForm').hidden = true;
  }

  function reveal() {
    if (state.revealed || !state.current || answerLocked) return;
    state.revealed = true;
    $('card').classList.add('flipped');
    if (window.VMMotion) $('card').dataset.revealed = 'true';
    if (window.VMMotion) window.VMMotion.flip();
    playFlipSound();
    updateRows();
    if (L) { cardElLabel(); announce(tr('a11y.revealed', { a: $('cardTrans').textContent })); }
    if (isTyping()) {
      pendingTypedAnswer = false;
      showAnswerFeedback(tr('feedback.answer', { a: $('cardTrans').textContent }), true);
    }
  }

  function speakCurrent() {
    if (!state.current) return;
    if (isListen()) { speakText(state.current.original, state.cfg.source); return; }
    var fwd = state.curSide === 'fwd';
    if (!state.revealed) {
      speakText(fwd ? state.current.original : state.current.translation, fwd ? state.cfg.source : state.cfg.target);
    } else {
      speakText(fwd ? state.current.translation : state.current.original, fwd ? state.cfg.target : state.cfg.source);
    }
  }

  /* Искры при верном ответе — лёгкий акцент без оверкилла */
  function burstSparkles() {
    try {
      var card = $('card');
      if (!card || typeof document.createElement !== 'function') return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var count = 10;
      for (var i = 0; i < count; i++) {
        var s = document.createElement('span');
        s.className = 'sparkle';
        if (s.style && typeof s.style.setProperty === 'function') {
          var a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
          var dist = 70 + Math.random() * 70;
          s.style.setProperty('--tx', (Math.cos(a) * dist).toFixed(1) + 'px');
          s.style.setProperty('--ty', (Math.sin(a) * dist * 0.8).toFixed(1) + 'px');
        }
        card.appendChild(s);
        (function (el) {
          setTimeout(function () { if (el && typeof el.remove === 'function') el.remove(); }, 820);
        })(s);
      }
    } catch (e) {}
  }

  /* Короткая вспышка на карточке: бирюзовая при «знал», розовая при «забыл» */
  function flashCard(cls) {
    try {
      var card = $('card');
      if (!card || !card.classList) return;
      card.classList.remove('flash-ok', 'flash-no');
      if (card.offsetWidth !== undefined) void card.offsetWidth; /* перезапуск анимации */
      card.classList.add(cls);
      setTimeout(function () {
        try { card.classList.remove(cls); } catch (e) {}
      }, 640);
    } catch (e) {}
  }

  /* Плашка, парящая над карточкой: «+1», «🔥 серия ×N» или «вернётся в цикл» */
  var combo = 0;

  function floatLabel(text, kind) {
    try {
      var card = $('card');
      if (!card || typeof document.createElement !== 'function') return;
      var el = document.createElement('span');
      el.className = 'float-label ' + kind;
      el.textContent = text;
      card.appendChild(el);
      setTimeout(function () { if (el && typeof el.remove === 'function') el.remove(); }, 960);
    } catch (e) {}
  }

  /* Кинематографичный выход карточки перед появлением следующей */
  function exitCard(cls) {
    try {
      var card = $('card');
      if (!card || !card.classList) return;
      card.classList.remove('exit-ok', 'exit-no');
      if (card.offsetWidth !== undefined) void card.offsetWidth; /* перезапуск анимации */
      card.classList.add(cls);
    } catch (e) {}
  }

  /* Confetti-финал для сильной сессии */
  function burstConfetti(n) {
    try {
      var summ = $('summary');
      if (!summ || typeof document.createElement !== 'function') return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var colors = ['#ffc46b', '#ff8a72', '#a78bfa', '#5ee6a8', '#7dd3fc', '#f4f1ea'];
      var count = n || 46;
      for (var i = 0; i < count; i++) {
        var s = document.createElement('span');
        s.className = 'confetti';
        if (s.style && typeof s.style.setProperty === 'function') {
          s.style.setProperty('--l', (3 + Math.random() * 94).toFixed(1) + '%');
          s.style.setProperty('--cx', ((Math.random() - 0.5) * 280).toFixed(0) + 'px');
          s.style.setProperty('--cr', (360 + Math.random() * 720).toFixed(0) + 'deg');
          s.style.setProperty('--dl', (Math.random() * 0.75).toFixed(2) + 's');
          s.style.setProperty('--c', colors[i % colors.length]);
        }
        summ.appendChild(s);
        (function (el) {
          setTimeout(function () { if (el && typeof el.remove === 'function') el.remove(); }, 3800);
        })(s);
      }
    } catch (e) {}
  }

  /* Числа в сводке «набегают» счётчиком */
  function countUpGrid() {
    try {
      var grid = $('summaryGrid');
      if (!grid || typeof grid.querySelectorAll !== 'function') return;
      var cells = grid.querySelectorAll('b');
      if (!cells || !cells.length) return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      Array.prototype.forEach.call(cells, function (b) {
        var target = parseInt(b.textContent, 10);
        if (isNaN(target) || target <= 0) return; /* время («0:45») не трогаем */
        b.textContent = '0';
        var start = Date.now(), dur = 780;
        var step = function () {
          var p = Math.min(1, (Date.now() - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          b.textContent = String(Math.round(target * eased));
          if (p < 1) setTimeout(step, 16);
        };
        step();
      });
    } catch (e) {}
  }

  /* Короткая подсветка клавиши в подсказках при нажатии */
  function pulseHint(idx) {
    try {
      var keys = document.querySelectorAll('.hint-keys kbd');
      if (!keys || !keys[idx]) return;
      var kb = keys[idx];
      kb.classList.remove('pulse');
      if (kb.offsetWidth !== undefined) void kb.offsetWidth;
      kb.classList.add('pulse');
      setTimeout(function () { try { kb.classList.remove('pulse'); } catch (e) {} }, 460);
    } catch (e) {}
  }

  var answerLocked = false, summaryRecorded = false;
  // rating: 'again' | 'hard' | 'good' | 'easy' (SM-2); defaults from knew.
  function answer(knew, rating) {
    var c = state.current;
    if (!c || answerLocked) return;
    // Even self-assessment must show the correct answer before advancing.
    if (L && !state.revealed) {
      reveal();
      showAnswerFeedback(tr('feedback.answer', { a: $('cardTrans').textContent }), false);
      return;
    }
    answerLocked = true;
    undoSnap = { card: c, fields: { streak: c.streak, fails: c.fails, box: c.box, due: c.due, ease: c.ease, interval: c.interval, reps: c.reps, lapses: c.lapses }, queue: state.roundQueue.slice(), side: state.curSide,
      known: state.known, forgot: state.forgot, answers: state.answers, combo: combo, round: state.round, roundTotal: state.roundTotal,
      nextRoundQueue: state.nextRoundQueue ? state.nextRoundQueue.slice() : null, day: L ? L.day() : null, knew: knew };

    state.answers++;
    if (knew) {
      combo++;
      state.known++;
      c.streak++;
      playSuccessSound();
      if (!window.VMMotion) {
        burstSparkles(); flashCard('flash-ok'); exitCard('exit-ok');
        floatLabel(combo >= 3 ? tr('float.combo', { n: combo }) : '+1', 'ok');
      }
      // Карточка успешно закреплена в этом раунде
    } else {
      combo = 0;
      state.forgot++;
      c.streak = 0;
      c.fails++;
      playForgotSound();
      if (!window.VMMotion) { flashCard('flash-no'); exitCard('exit-no'); floatLabel(tr('float.back'), 'no'); }
      // Повторяем забытое слово через 2-3 карточки в текущем раунде
      var insertPos = Math.min(state.roundQueue.length, 3);
      state.roundQueue.splice(insertPos, 0, c.id);
    }

    if (L) {
      L.schedule(c, knew ? (rating === 'hard' || rating === 'easy' ? rating : 'good') : 'again');
      recordAnswer(knew); archiveCards(); saveSession();
    }
    state.revealed = false;
    // Keep the answer side visible throughout the departure. Reset only after
    // the card has left; otherwise the flip is cut off by the old 180ms timer.
    if (!window.VMMotion) $('card').classList.remove('flipped');
    if (window.VMMotion) updateNextPreview();
    var departureMs = window.VMMotion ? window.VMMotion.depart(knew) : 180;
    clearTimeout(nextCardTimer);
    nextCardTimer = setTimeout(function () {
      nextCardTimer = null;
      nextCard(false);
    }, departureMs);
    renderStats();
    updateUndo();
  }

  var undoSnap = null;
  function updateUndo() { var b = $('btnUndo'); if (b) b.disabled = !undoSnap; }
  function undoAnswer() {
    var s = undoSnap;
    if (!s || !L || !$('screen-train').classList.contains('active')) return;
    clearTimeout(nextCardTimer); nextCardTimer = null;
    Object.assign(s.card, s.fields);
    state.roundQueue = s.queue; state.nextRoundQueue = s.nextRoundQueue; state.round = s.round; state.roundTotal = s.roundTotal;
    state.known = s.known; state.forgot = s.forgot; state.answers = s.answers; combo = s.combo;
    state.current = s.card; state.curSide = s.side; state.revealed = false; answerLocked = false;
    var h = library.history[s.day];
    if (h) { h.answers = Math.max(0, h.answers - 1); if (s.knew) h.correct = Math.max(0, h.correct - 1); }
    undoSnap = null;
    archiveCards(); saveSession(); persistLibrary(); renderDaily();
    renderCard(); renderStats(); updateUndo();
    toast(tr('toast.undone'), 'ok', 1400);
  }

  var lastStats = {};

  /* Обновление ячейки статистики: значение меняется, ячейка коротко «подскакивает» */
  function setStat(id, val) {
    var el = $(id);
    if (!el) return;
    var s = String(val);
    if (el.textContent !== s) el.textContent = s;
    if (lastStats[id] !== undefined && lastStats[id] !== s && el.classList) {
      var host = el.parentNode || el;
      if (host.classList) {
        host.classList.remove('bump');
        if (host.offsetWidth !== undefined) void host.offsetWidth; /* перезапуск анимации */
        host.classList.add('bump');
      }
    }
    lastStats[id] = s;
  }

  function renderStats() {
    setStat('stRound', state.round);
    setStat('stKnown', state.known);
    setStat('stForgot', state.forgot);
    setStat('stAcc', state.answers ? Math.round((state.known / state.answers) * 100) + '%' : '—');
    setStat('stLeft', state.roundQueue.length + (state.current ? 1 : 0));

    /* Прогресс-бар раунда: сколько карточек уже закрыто в этом круге */
    var rb = $('roundBar');
    if (rb && rb.style) {
      var left = state.roundQueue.length + (state.current ? 1 : 0);
      var done = Math.max(0, state.roundTotal - left);
      rb.style.width = (state.roundTotal ? Math.round((done / state.roundTotal) * 100) : 0) + '%';
    }
  }

  function fmtTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function startTimer() {
    clearInterval(state.timer);
    state.timer = setInterval(function () {
      if ($('summary').hidden === false) return;
      if (!$('screen-train').classList.contains('active')) return;
      state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      $('stTime').textContent = fmtTime(state.elapsed);
    }, 1000);
  }

  /* ---------------- summary ---------------- */

  /* Плавная заливка кольца точности: --acc от 0 до итогового значения */
  function animateAccuracy(to) {
    var ring = $('sumRing');
    var accEl = $('sumAcc');
    var canSet = ring && ring.style && typeof ring.style.setProperty === 'function';
    if (!canSet && !accEl) return;

    var reduced = false;
    try { reduced = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) {}
    var dur = reduced ? 0 : 850;
    var start = Date.now();

    var step = function () {
      var p = dur ? Math.min(1, (Date.now() - start) / dur) : 1;
      var eased = 1 - Math.pow(1 - p, 3);
      var v = Math.round(to * eased);
      if (canSet) ring.style.setProperty('--acc', v + '%');
      if (accEl) accEl.textContent = v + '%';
      if (p < 1) { setTimeout(step, 16); return; }
      /* кольцо «довольно» — короткий пульс по завершении заливки */
      try {
        if (ring && ring.classList) {
          ring.classList.add('done');
          setTimeout(function () { try { ring.classList.remove('done'); } catch (e) {} }, 950);
        }
      } catch (e) {}
    };
    step();
  }

  function showSummary() {
    if (nextCardTimer) {
      clearTimeout(nextCardTimer);
      nextCardTimer = null;
      nextCard(false);
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    if (L && state.answers > 0 && !summaryRecorded) { L.complete(library.streak, L.day()); summaryRecorded = true; persistLibrary(); renderDaily(); }
    var acc = state.answers ? Math.round((state.known / state.answers) * 100) : 0;
    var mastered = state.cards.filter(function (c) { return c.streak >= 2 && c.fails === 0; }).length;

    /* Кольцо точности заливается счётчиком */
    animateAccuracy(acc);

    $('summaryGrid').innerHTML =
      '<div><b>' + state.cards.length + '</b><span data-i18n="st.cards">' + tr('st.cards') + '</span></div>' +
      '<div><b>' + state.answers + '</b><span data-i18n="st.answers">' + tr('st.answers') + '</span></div>' +
      '<div><b>' + state.known + '</b><span data-i18n="st.known">' + tr('st.known') + '</span></div>' +
      '<div><b>' + state.forgot + '</b><span data-i18n="st.forgot">' + tr('st.forgot') + '</span></div>' +
      '<div><b>' + state.round + '</b><span data-i18n="st.round">' + tr('st.round') + '</span></div>' +
      '<div><b>' + fmtTime(state.elapsed) + '</b><span data-i18n="st.time">' + tr('st.time') + '</span></div>';

    var msg;
    state.summaryMsg = !state.answers ? ['sum.msg0'] : acc >= 90 ? ['sum.msg90', mastered] : acc >= 65 ? ['sum.msg65'] : ['sum.msgLow'];
    msg = summaryMessage();
    $('summaryMsg').textContent = msg;

    /* Кинематографичный финал: confetti для уверенной сессии */
    if (!window.VMMotion && state.answers >= 5 && acc >= 60) burstConfetti(acc >= 85 ? 70 : 46);
    countUpGrid();

    var summ = $('summary');
    if (summ) {
      summ.hidden = false;
      summ.style.display = '';
      if (window.VMMotion) window.VMMotion.summary(state.answers > 0);
    }
  }

  function summaryMessage() {
    var m = state.summaryMsg || ['sum.msg0'];
    return m.length > 1 ? trn(m[0], m[1]) : tr(m[0]);
  }

  function hideSummary() {
    if (window.VMMotion) window.VMMotion.stop('summaryMotion');
    var summ = $('summary');
    if (summ) {
      summ.hidden = true;
      summ.style.display = 'none';
    }
    state.startedAt = Date.now() - state.elapsed * 1000;
  }

  function startNewSet() {
    // 1. Остановка таймеров тренировки и перехода к следующей карточке
    clearInterval(state.timer);
    state.timer = null;
    clearTimeout(nextCardTimer);
    nextCardTimer = null;

    // 2. Закрытие оверлея сводки
    var summ = $('summary');
    if (summ) {
      summ.hidden = true;
      summ.style.display = 'none';
    }

    // 3. Сброс runtime состояния тренировки
    state.cards = [];
    state.roundQueue = [];
    state.roundTotal = 0;
    state.current = null;
    state.revealed = false;
    state.round = 1;
    state.known = 0;
    state.forgot = 0;
    state.answers = 0;
    state.startedAt = 0;
    state.elapsed = 0;
    state.cancelled = true;
    undoSnap = null;

    // 4. Остановка озвучки речи при смене набора
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    // 5. Сброс UI индикаторов и карточек тренировки
    var topPill = $('topPill');
    if (topPill) {
      topPill.hidden = true;
      topPill.textContent = '';
    }
    var card = $('card');
    if (card) {
      card.classList.remove('flipped', 'pop');
    }
    updateRows();
    if ($('cardWord')) $('cardWord').textContent = '—';
    if ($('cardTrans')) $('cardTrans').textContent = '—';
    if ($('cardHint')) $('cardHint').textContent = '';
    if ($('stRound')) $('stRound').textContent = '1';
    if ($('stKnown')) $('stKnown').textContent = '0';
    if ($('stForgot')) $('stForgot').textContent = '0';
    if ($('stAcc')) $('stAcc').textContent = '—';
    if ($('stTime')) $('stTime').textContent = '0:00';
    if ($('stLeft')) $('stLeft').textContent = '0';

    // 6. Очистка сохранённой сессии (так как пользователь начал новый набор)
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
    if ($('resumeBox')) $('resumeBox').hidden = true;

    // 7. Переход на экран настройки
    show('screen-setup');

    // 8. Сброс истории браузера при необходимости
    try {
      if (window.history.state && window.history.state.screen === 'train') {
        window.history.replaceState({ screen: 'setup' }, '');
      }
    } catch (e) {}

    // 9. Фокус и выделение поля ввода для удобного ввода новых слов (кросс-браузерно для десктопа и мобильных)
    var input = $('input');
    if (input) {
      input.focus();
      try {
        if (typeof input.setSelectionRange === 'function') {
          input.setSelectionRange(0, input.value.length);
        } else {
          input.select();
        }
      } catch (e) {
        try { input.select(); } catch (e2) {}
      }
    }
    updateInputStat(true);

    toast(tr('toast.newSet'), 'ok', 2200);
  }

  function statsText() {
    var acc = state.answers ? Math.round((state.known / state.answers) * 100) : 0;
    return tr('sum.stats', { c: state.cards.length, a: state.answers, p: acc, r: state.round, t: fmtTime(state.elapsed) });
  }

  /* ---------------- pipeline ---------------- */

  async function start() {
    if (L && state.cfg.source === state.cfg.target) { toast(tr('toast.diffLangs'), 'err'); return; }
    var raw = $('input').value;
    var parsed = parseInput(raw);
    if (!parsed.items.length) {
      toast(tr('toast.pasteWords'), 'err');
      $('input').focus();
      return;
    }

    state.cancelled = false;
    show('screen-loading');
    $('loadTitle').textContent = tr('load.processing');
    setLoad(8, tr('load.analyzing'), tr('load.selected', { n: parsed.items.length }) + (parsed.dropped ? tr('load.droppedN', { n: parsed.dropped }) : ''));

    try {
      var cards = await buildCards(parsed.items);
      if (state.cancelled) { show('screen-setup'); return; }
      if (!cards || !cards.length) throw new Error(tr('err.noCards'));
      setLoad(100, tr('load.done'), tr('load.cards', { n: cards.length }));
      await new Promise(function (r) { setTimeout(r, 350); });
      startTraining(cards);
    } catch (e) {
      show('screen-setup');
      toast(e.message || tr('err.generic'), 'err', 5000);
      $('apiBox').open = true;
    }
  }

  /* ---------------- Library, daily practice and lexical resource ---------------- */
  var LIBRARY_KEY = 'vocabulary-master.library.v2';
  var library = { decks: {}, history: {}, goal: 10, streak: { count: 0, last: null, freezes: 2, enabled: true } };
  var pendingTypedAnswer = null, lexical = null;
  var CONTEXT = {
    serendipity: ['The chance occurrence of a happy discovery.', 'Finding this little bookshop was pure serendipity.'],
    'to remember': ['To keep something in your memory.', 'I try to remember one new word every day.'],
    journey: ['An act of travelling from one place to another.', 'Our journey across the country took three days.'],
    brave: ['Ready to face danger or difficulty.', 'It was brave of her to speak honestly.'],
    quiet: ['Making little or no noise.', 'We found a quiet place to read.'],
    'to achieve': ['To succeed in reaching a goal through effort.', 'Practice helps us achieve our goals.'],
    weather: ['The conditions of the atmosphere at a given time.', 'The weather changed during the afternoon.'],
    'to borrow': ['To take something with permission and return it later.', 'May I borrow your dictionary?'],
    narrow: ['Having a small distance between two sides.', 'A narrow path leads to the garden.'],
    'to explain': ['To make something clear or easy to understand.', 'Can you explain the rule again?'],
    resilience: ['The ability to recover after difficulties.', 'Her resilience helped her overcome the setback.'],
    'to waste': ['To use something carelessly or without purpose.', 'We should not waste clean water.'],
    deep: ['Extending a long way down from the surface.', 'The lake is surprisingly deep.'],
    'to notice': ['To become aware of something.', 'Did you notice the change in her voice?'],
    apple: ['A round fruit with crisp flesh.', 'She put an apple in her bag.'],
    house: ['A building in which people live.', 'Their house stands beside the river.'],
    water: ['A clear liquid essential for life.', 'Please bring a glass of water.'],
    book: ['Written pages bound together.', 'This book changed my perspective.'],
    cat: ['A small domesticated feline.', 'The cat slept beside the window.'],
    dog: ['A domesticated animal often kept as a companion.', 'The dog waited patiently by the door.']
  };
  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; });
  }

  function swapLanguages() {
    var s = state.cfg.source; state.cfg.source = state.cfg.target; state.cfg.target = s;
    $('sourceLang').value = state.cfg.source; $('targetLang').value = state.cfg.target; saveCfg();
    var input = $('input'), before = input.value, after = L.swapPairs(before);
    if (after !== before) { input.value = after; updateInputStat(true); }
    var b = $('btnSwapLang'); b.classList.remove('spin'); void b.offsetWidth; b.classList.add('spin');
    toast(langByCode(state.cfg.source).label + ' → ' + langByCode(state.cfg.target).label + (after !== before ? tr('toast.swapPairs') : ''), 'ok', 1800);
  }
  function showHint() {
    var c = state.current;
    if (!c || state.revealed || answerLocked) return;
    state.hintLevel = (state.hintLevel || 0) + 1;
    $('cardSub').textContent = '💡 ' + L.hint(expectedAnswer(), state.hintLevel);
    if (isTyping()) $('typedAnswer').focus();
  }
  function practiceDeck(d, mode) {
    state.cfg.source = d.source; state.cfg.target = d.target; saveCfg();
    $('sourceLang').value = d.source; $('targetLang').value = d.target;
    var cards = L.pick(d.cards, mode), all = mode === 'all';
    if (mode === 'due' && !cards.length) { cards = L.pick(d.cards, 'all'); all = true; }
    // A capped session takes the most overdue / hardest words, or a random slice of the whole deck.
    if (library.batch && cards.length > library.batch) cards = (all ? shuffle(cards.slice()) : cards).slice(0, library.batch);
    if (!cards.length) { toast(tr(mode === 'hard' ? 'toast.noHard' : 'toast.needTr'), mode === 'hard' ? 'ok' : 'err'); return; }
    startTraining(cards);
  }
  function reverseDeck(d) {
    var key = d.target + '-' + d.source;
    var rev = library.decks[key] || { source: d.target, target: d.source, cards: [], created: Date.now() };
    var added = 0;
    L.reverseCards(d.cards).forEach(function (c) {
      if (rev.cards.some(function (x) { return x.original.toLowerCase() === c.original.toLowerCase(); })) return;
      rev.cards.push(c); added++;
    });
    library.decks[key] = rev; persistLibrary(); renderLibrary();
    toast(added ? tr('toast.reversed', { p: langByCode(rev.source).label + ' → ' + langByCode(rev.target).label, n: trn('words.count', added) }) : tr('toast.reverseSame'), 'ok');
  }
  async function copyDeck(d) {
    var text = d.cards.map(function (c) { return c.original + ' - ' + c.translation; }).join('\n');
    try { await navigator.clipboard.writeText(text); toast(tr('toast.copied'), 'ok'); }
    catch (e) {
      var link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
      link.download = d.source + '-' + d.target + '.txt'; link.click();
      setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
    }
  }
  function highlight(text, q) {
    var s = String(text || ''), i = s.toLocaleLowerCase().indexOf(q);
    if (i < 0) return escapeHTML(s);
    return escapeHTML(s.slice(0, i)) + '<mark>' + escapeHTML(s.slice(i, i + q.length)) + '</mark>' + escapeHTML(s.slice(i + q.length));
  }
  function renderSearch() {
    var box = $('searchResults'), q = $('librarySearch').value.toLocaleLowerCase().trim();
    $('libraryGrid').hidden = !!q; box.hidden = !q;
    if (!q) { box.innerHTML = ''; return; }
    var hits = [];
    Object.keys(library.decks).forEach(function (key) {
      var d = library.decks[key];
      d.cards.forEach(function (c) { if ((c.original + '\n' + c.translation).toLocaleLowerCase().indexOf(q) >= 0) hits.push({ d: d, c: c }); });
    });
    box.innerHTML = '<p class="search-head">' + (hits.length ? tr('search.found', { n: hits.length }) : escapeHTML(tr('search.none', { q: q }))) + '</p>' +
      hits.slice(0, 100).map(function (h) {
        return '<div class="saved-word"><strong>' + highlight(h.c.original, q) + '</strong><span>' + highlight(h.c.translation, q) + '</span><span class="deck-kicker">' +
          escapeHTML(langByCode(h.d.source).label + ' → ' + langByCode(h.d.target).label) + (h.c.fails ? tr('search.mistakes', { n: h.c.fails }) : '') + '</span></div>';
      }).join('');
  }
  function renderActivity() {
    var days = L.activity(library.history, 84, L.day());
    var p = days[0].date.split('-').map(Number);
    var pad = (new Date(p[0], p[1] - 1, p[2]).getDay() + 6) % 7; // first column starts on Monday
    var cells = [];
    for (var i = 0; i < pad; i++) cells.push('<i class="pad"></i>');
    days.forEach(function (d) {
      var lvl = !d.answers ? 0 : d.answers >= library.goal ? 4 : Math.min(3, 1 + Math.floor(d.answers * 3 / library.goal));
      cells.push('<i class="l' + lvl + '" title="' + d.date + ': ' + trn('act.answers', d.answers) + '"></i>');
    });
    $('activityMap').innerHTML = cells.join('');
    var active = days.filter(function (d) { return d.answers; }).length;
    var answers = days.reduce(function (n, d) { return n + d.answers; }, 0);
    var words = 0, mastered = 0;
    Object.keys(library.decks).forEach(function (k) { library.decks[k].cards.forEach(function (c) { words++; if (c.streak >= 2) mastered++; }); });
    $('activityStats').textContent = trn('act.days', active) + ' · ' + trn('act.answers', answers) + ' · ' + trn('words.count', words) + ' · ' + tr('act.mastered', { n: mastered });
  }

  // Words added offline end up as "—"; translate them once the network is back.
  var retrying = false, retried = Object.create(null);
  async function retryMissingTranslations() {
    if (retrying || navigator.onLine === false) return;
    retrying = true;
    var fixed = 0, budget = 30;
    try {
      for (var key in library.decks) {
        var d = library.decks[key];
        for (var i = 0; i < d.cards.length && budget > 0; i++) {
          var c = d.cards[i];
          if ((c.translation && c.translation !== '—') || retried[key + ':' + c.original]) continue;
          retried[key + ':' + c.original] = true; budget--;
          var text = await translateSingleFree(c.original, d.target, d.source);
          if (!text || text === '—') continue;
          c.translation = text; fixed++;
          state.cards.forEach(function (sc) { if (sc.original === c.original && (!sc.translation || sc.translation === '—')) sc.translation = text; });
        }
      }
    } finally { retrying = false; }
    if (!fixed) return;
    persistLibrary();
    if ($('screen-library').classList.contains('active')) renderLibrary();
    toast(trn('toast.retried', fixed), 'ok', 3000);
  }

  var match = null;
  function stopMatch() { if (match && match.timer) { clearInterval(match.timer); match.timer = null; } }
  function matchBest() { try { return JSON.parse(localStorage.getItem('vm.match-best') || '{}'); } catch (e) { return {}; } }
  function renderMatchStats() {
    if (!match) return;
    $('matchTime').textContent = '⏱ ' + fmtTime(Math.floor(((match.end || Date.now()) - match.start) / 1000));
    $('matchMistakes').textContent = trn('match.mistakes', match.mistakes);
    var best = matchBest()[match.key];
    $('matchBest').textContent = best ? tr('match.best', { t: fmtTime(Math.round(best / 1000)) }) : '';
  }
  function startMatch() {
    var key = $('quizDeck').value, d = library.decks[key];
    if (!d) { toast(tr('toast.createDeck'), 'err'); return; }
    var picked = L.pairs(d.cards, 6);
    if (picked.length < 3) { toast(tr('toast.needMatch'), 'err'); return; }
    stopMatch();
    var tiles = [];
    picked.forEach(function (c, i) { tiles.push({ i: i, side: 'a', text: c.original }, { i: i, side: 'b', text: c.translation }); });
    shuffle(tiles);
    match = { key: key, left: picked.length, mistakes: 0, start: Date.now(), end: 0, pick: null };
    var grid = $('matchGrid'); grid.innerHTML = '';
    tiles.forEach(function (tile) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.className = 'match-tile ' + tile.side; b.textContent = tile.text; b.lang = tile.side === 'a' ? d.source : d.target;
      b.onclick = function () { pickTile(tile, b); };
      grid.appendChild(b);
    });
    $('matchStats').hidden = false; $('btnMatchStart').textContent = tr('match.restart');
    match.timer = setInterval(renderMatchStats, 500); renderMatchStats();
  }
  function pickTile(tile, b) {
    if (!match || match.end || b.disabled) return;
    var p = match.pick;
    if (p) { p.b.classList.remove('sel'); p.b.setAttribute('aria-pressed', 'false'); }
    if (!p || p.tile.side === tile.side) { if (!p || p.b !== b) { match.pick = { tile: tile, b: b }; b.classList.add('sel'); b.setAttribute('aria-pressed', 'true'); } else match.pick = null; return; }
    match.pick = null;
    if (p.tile.i === tile.i) {
      p.b.classList.add('done'); b.classList.add('done'); p.b.disabled = b.disabled = true; playSuccessSound();
      if (--match.left === 0) finishMatch();
      return;
    }
    match.mistakes++; playForgotSound(); renderMatchStats();
    [p.b, b].forEach(function (el) { el.classList.remove('wrong'); void el.offsetWidth; el.classList.add('wrong'); setTimeout(function () { el.classList.remove('wrong'); }, 450); });
  }
  function finishMatch() {
    match.end = Date.now(); stopMatch();
    var ms = match.end - match.start, best = matchBest(), record = !best[match.key] || ms < best[match.key];
    if (record) { best[match.key] = ms; try { localStorage.setItem('vm.match-best', JSON.stringify(best)); } catch (e) {} }
    renderMatchStats();
    toast(tr(record ? 'match.record' : 'match.done', { t: fmtTime(Math.round(ms / 1000)) }), 'ok', 3200);
    L.complete(library.streak, L.day()); persistLibrary(); renderDaily();
  }

  function toggleCard() {
    if (answerLocked || !state.current) return;
    if (!state.revealed || isTyping()) { reveal(); return; }
    state.revealed = false;
    $('card').classList.remove('flipped');
    if (window.VMMotion) { $('card').dataset.revealed = 'false'; window.VMMotion.flip(false); }
    playFlipSound(); updateRows();
  }
  function readTranslationCache(word, source, target) {
    try { return JSON.parse(localStorage.getItem('vm.translation-cache') || '{}')[source + ':' + target + ':' + word] || null; } catch(e) { return null; }
  }
  function writeTranslationCache(word, source, target, text) {
    try {
      var cache = JSON.parse(localStorage.getItem('vm.translation-cache') || '{}');
      if (Object.keys(cache).length > 1000) cache = {};
      cache[source + ':' + target + ':' + word] = text;
      localStorage.setItem('vm.translation-cache', JSON.stringify(cache));
    } catch(e) {}
  }
  function persistLibrary() {
    try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(library)); }
    catch(e) { toast(tr('toast.saveFail'), 'err'); }
  }
  function enrichLocalContext(cards) {
    if (state.cfg.source !== 'en') return;
    cards.forEach(function (c) {
      var ctx = CONTEXT[c.original.toLowerCase()];
      if (ctx) { if (!c.definition) c.definition = ctx[0]; if (!(c.examples || []).length) c.examples = [ctx[1]]; }
    });
  }
  function archiveCards() {
    var key = state.cfg.source + '-' + state.cfg.target;
    var d = library.decks[key] || { source: state.cfg.source, target: state.cfg.target, cards: [], created: Date.now() };
    state.cards.forEach(function (card) {
      var idx = d.cards.findIndex(function (c) { return L.validate(c.original, card.original) && c.original.toLowerCase() === card.original.toLowerCase(); });
      if (idx < 0) d.cards.push(Object.assign({}, card)); else d.cards[idx] = Object.assign({}, card);
    });
    library.decks[key] = d;
    persistLibrary();
  }
  function recordAnswer(ok) {
    var key = L.day();
    var h = library.history[key] || { answers: 0, correct: 0 };
    h.answers++; if (ok) h.correct++;
    library.history[key] = h;
    if (h.answers >= library.goal && !h.celebrated) {
      h.celebrated = true;
      if (window.VMMotion) window.VMMotion.goal();
      else { burstConfetti(35); toast(tr('goal.text'), 'ok'); }
    }
    persistLibrary(); renderDaily();
  }
  function renderDaily() {
    var h = library.history[L.day()] || { answers: 0 };
    $('streakCount').textContent = trn('streak.days', library.streak.count);
    $('dailyTitle').textContent = tr(h.answers >= library.goal ? 'daily.done' : 'daily.almost');
    $('dailyText').textContent = tr('daily.text', { a: h.answers, g: library.goal });
    $('dailyBar').style.width = Math.min(100, h.answers / library.goal * 100) + '%';
    $('freezeEnabled').checked = library.streak.enabled;
    $('freezeBalance').textContent = tr('freeze.left', { n: library.streak.freezes });
    $('dailyGoal').value = library.goal;
    $('batchSize').value = String(library.batch || 0);
  }
  function navigateLearning(id) {
    stopMatch();
    clearTimeout(nextCardTimer); nextCardTimer = null;
    clearInterval(state.timer);
    if (state.answers && !summaryRecorded) { L.complete(library.streak, L.day()); summaryRecorded = true; persistLibrary(); }
    hideSummary();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    show(id); renderDaily();
    document.querySelectorAll('.nav-link').forEach(function (b) { b.classList.toggle('active', b.id === ({'screen-setup':'navStudy','screen-library':'navLibrary','screen-test':'navTest'})[id]); });
    if (id === 'screen-library') renderLibrary();
    if (id === 'screen-test') fillQuizDecks();
  }
  function renderLibrary() {
    var host = $('libraryGrid'); host.innerHTML = '';
    renderActivity(); renderSearch();
    var keys = Object.keys(library.decks);
    if (!keys.length) {
      host.innerHTML = '<div class="empty-library"><h2>' + tr('lib.emptyH') + '</h2><p>' + tr('lib.emptyP') + '</p><button class="btn primary" type="button" data-action="new">' + tr('lib.emptyBtn') + '</button></div>';
      host.querySelector('button').onclick = function () { navigateLearning('screen-setup'); };
      return;
    }
    keys.forEach(function (key) {
      var d = library.decks[key];
      var mastered = d.cards.filter(function (c) { return c.streak >= 2; }).length;
      var due = L.pick(d.cards, 'due').length, hard = L.pick(d.cards, 'hard').length;
      var panel = document.createElement('article'); panel.className = 'deck-item';
      panel.innerHTML = '<span class="deck-kicker">→ ' + escapeHTML(langByCode(d.target).label) + ' / ' + trn('words.count', d.cards.length) + '</span><h2>' + escapeHTML(langByCode(d.source).label) + '</h2><p>' + tr('deck.stats', { m: mastered, d: due, h: trn('deck.hard', hard) }) + '</p><div class="daily-track" style="width:100%"><i style="width:' + Math.round(mastered / Math.max(1,d.cards.length) * 100) + '%"></i></div>' +
        '<div class="actions"><button class="btn primary" type="button" data-act="practice" title="' + tr('deck.practiceTitle') + '">' + (due ? tr('deck.practiceDue', { n: due }) : tr('deck.practiceAll')) + '</button><button class="btn" type="button" data-act="hard"' + (hard ? '' : ' disabled') + ' title="' + tr('deck.hardTitle') + '">' + tr('deck.hardBtn', { n: hard }) + '</button><button class="btn" type="button" data-act="add">' + tr('deck.add') + '</button></div>' +
        '<div class="deck-tools"><button class="link" type="button" data-act="reverse" title="' + escapeHTML(tr('deck.reverseTitle', { p: langByCode(d.target).label + ' → ' + langByCode(d.source).label })) + '">' + tr('deck.reverse') + '</button><button class="link" type="button" data-act="copy">' + tr('deck.copy') + '</button></div>' +
        '<details><summary>' + tr('deck.all') + '</summary><div class="word-list"></div><button class="link" type="button" data-act="delete" style="margin-top:12px;color:var(--rose)">' + tr('deck.delete') + '</button></details>';
      var list = panel.querySelector('.word-list');
      d.cards.forEach(function (c, i) {
        var row = document.createElement('div'); row.className = 'saved-word';
        row.innerHTML = '<strong>' + escapeHTML(c.original) + '</strong><span>' + escapeHTML(c.translation) + '</span><div class="word-actions"><button class="link" data-act="edit">' + tr('word.edit') + '</button><button class="link" data-act="remove">' + tr('word.remove') + '</button></div>';
        row.querySelector('[data-act="edit"]').onclick = function () {
          var value = window.prompt(tr('word.prompt', { w: c.original }), c.translation);
          if (value === null || !value.trim()) return;
          c.translation = value.trim(); persistLibrary(); renderLibrary();
        };
        row.querySelector('[data-act="remove"]').onclick = function () { d.cards.splice(i,1); persistLibrary(); renderLibrary(); };
        list.appendChild(row);
      });
      panel.querySelector('[data-act="practice"]').onclick = function () {
        if (!d.cards.length) { toast(tr('toast.addWords'), 'err'); return; }
        practiceDeck(d, 'due');
      };
      panel.querySelector('[data-act="hard"]').onclick = function () { practiceDeck(d, 'hard'); };
      panel.querySelector('[data-act="reverse"]').onclick = function () { reverseDeck(d); };
      panel.querySelector('[data-act="copy"]').onclick = function () { copyDeck(d); };
      panel.querySelector('[data-act="add"]').onclick = function () {
        state.cfg.source = d.source; state.cfg.target = d.target; saveCfg();
        $('sourceLang').value = d.source; $('targetLang').value = d.target; $('input').value = '';
        navigateLearning('screen-setup'); $('input').focus(); updateInputStat(true);
      };
      panel.querySelector('[data-act="delete"]').onclick = function () {
        if (!window.confirm(tr('confirm.deleteDeck'))) return;
        delete library.decks[key]; persistLibrary(); renderLibrary();
      };
      host.appendChild(panel);
    });
    if (window.VMMotion) window.VMMotion.library();
  }
  function showAnswerFeedback(text, wrong) {
    $('answerFeedbackText').textContent = text;
    $('answerFeedback').classList.toggle('wrong', !!wrong);
    $('answerFeedback').hidden = false;
    $('rowHidden').hidden = true; $('rowShown').hidden = true;
    if (window.VMMotion) window.VMMotion.feedback(!wrong);
  }
  function checkTypedAnswer(e) {
    e.preventDefault();
    if (!state.current || state.revealed || answerLocked) return;
    var text = $('typedAnswer').value.trim();
    if (!text) { $('typedAnswer').focus(); return; }
    var expected = expectedAnswer();
    var ok = L.validate(text, expected);
    reveal(); pendingTypedAnswer = ok;
    showAnswerFeedback(tr(ok ? 'feedback.right' : 'feedback.almost', { a: expected }), !ok);
    $('btnNextAnswer').focus();
  }
  function fillQuizDecks() {
    lexical = null; $('quizBody').hidden = true; $('btnQuizStart').hidden = false;
    var sel = $('quizDeck'); sel.innerHTML = '';
    Object.keys(library.decks).forEach(function (key) {
      var d = library.decks[key]; var opt = document.createElement('option');
      opt.value = key; opt.textContent = langByCode(d.source).label + ' → ' + langByCode(d.target).label + ' · ' + d.cards.length;
      sel.appendChild(opt);
    });
  }
  function renderQuiz() {
    var q = lexical.questions[lexical.index];
    $('quizProgress').textContent = tr('quiz.progress', { i: lexical.index + 1, n: lexical.questions.length });
    $('quizQuestion').textContent = q.sentence || tr('quiz.meaning', { w: q.card.translation });
    $('quizAnswer').textContent = ''; $('btnQuizNext').hidden = true;
    var host = $('quizOptions'); host.innerHTML = '';
    q.options.forEach(function (opt, i) {
      var button = document.createElement('button'); button.className = 'quiz-option';
      button.textContent = 'ABCD'[i] + '.  ' + opt;
      button.onclick = function () {
        if (lexical.answered) return;
        lexical.answered = true;
        var ok = opt === q.card.original;
        if (ok) lexical.correct++;
        host.querySelectorAll('button').forEach(function (b, idx) { b.disabled = true; if (q.options[idx] === q.card.original) b.classList.add('correct'); });
        if (!ok) button.classList.add('wrong');
        L.grade(q.card, ok); recordAnswer(ok);
        $('quizAnswer').textContent = tr(ok ? 'quiz.correct' : 'quiz.answerWas') + q.card.original + ' — ' + q.card.translation + (q.card.definition ? '. ' + q.card.definition : '');
        $('btnQuizNext').hidden = false; persistLibrary();
      };
      host.appendChild(button);
    });
    if (window.VMMotion) window.VMMotion.quiz();
  }
  function initLearningUI() {
    try {
      var raw = JSON.parse(localStorage.getItem(LIBRARY_KEY) || 'null');
      if (raw && raw.decks && raw.streak && raw.history) library = raw;
    } catch(e) {}
    L.reconcile(library.streak, L.day()); persistLibrary(); renderDaily();
    LANGS.forEach(function (l) { var opt = document.createElement('option'); opt.value = l.code; opt.textContent = l.label; $('sourceLang').appendChild(opt); });
    $('sourceLang').value = state.cfg.source;
    $('sourceLang').onchange = function () {
      var prev = state.cfg.source; state.cfg.source = this.value;
      // Picking the same language on both sides means "swap them".
      if (state.cfg.target === this.value) { state.cfg.target = prev; $('targetLang').value = prev; }
      saveCfg();
    };
    $('btnSwapLang').onclick = swapLanguages;
    $('simpleMode').checked = state.cfg.simple;
    $('simpleMode').onchange = function () { state.cfg.simple = this.checked; saveCfg(); };
    document.querySelectorAll('#modeSeg button').forEach(function (b) { b.classList.toggle('on', b.dataset.mode === state.cfg.mode); b.onclick = function () {
      state.cfg.mode = b.dataset.mode; saveCfg(); document.querySelectorAll('#modeSeg button').forEach(function (btn) { btn.classList.toggle('on', btn === b); });
    }; });
    $('btnTheme').onclick = function () {
      var root = document.documentElement; root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('vm.theme', root.dataset.theme); } catch(e) {}
    };
    $('navStudy').onclick = function () { navigateLearning('screen-setup'); };
    $('navLibrary').onclick = function () { navigateLearning('screen-library'); };
    $('navTest').onclick = function () { navigateLearning('screen-test'); };
    $('btnAddDeck').onclick = function () { navigateLearning('screen-setup'); $('input').focus(); };
    $('librarySearch').oninput = renderSearch;
    $('batchSize').onchange = function () { library.batch = Number(this.value) || 0; persistLibrary(); };
    $('btnUndo').onclick = undoAnswer;
    $('btnMatchStart').onclick = startMatch;
    $('btnHint').onclick = showHint;
    $('btnHintTyping').onclick = showHint;
    $('freezeEnabled').onchange =function () { library.streak.enabled = this.checked; persistLibrary(); renderDaily(); };
    $('dailyGoal').onchange = function () { library.goal = Math.max(1, Math.min(200, Number(this.value) || 10)); persistLibrary(); renderDaily(); };
    $('btnExportLibrary').onclick = function () {
      // Library exports never include API keys or provider configuration.
      var blob = new Blob([JSON.stringify({ version: 2, library: library }, null, 2)], { type: 'application/json' });
      var link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'vocabulary-master-' + L.day() + '.json'; link.click();
      setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
    };
    $('importLibrary').onchange = async function () {
      var file = this.files[0]; if (!file) return;
      try {
        if (file.size > 5000000) throw new Error(tr('err.fileBig'));
        var data = JSON.parse(await file.text()); var incoming = data.library;
        if (!incoming || !incoming.decks || !incoming.history || !incoming.streak || data.version !== 2) throw new Error(tr('err.notBackup'));
        var safeDecks = {};
        Object.keys(incoming.decks).forEach(function (key) {
          var d = incoming.decks[key];
          if (!LANGS.some(function (l) { return l.code === d.source; }) || !LANGS.some(function (l) { return l.code === d.target; }) || !Array.isArray(d.cards) || d.cards.length > 5000) throw new Error(tr('err.badDeck'));
          var cards = d.cards.map(function (c) {
            if (typeof c.original !== 'string' || typeof c.translation !== 'string' || !c.original.trim() || c.original.length > 500 || c.translation.length > 1000) throw new Error(tr('err.badWord'));
            return { original:c.original, translation:c.translation, hint:String(c.hint || '').slice(0,1000), definition:String(c.definition || '').slice(0,2000), examples:Array.isArray(c.examples) ? c.examples.filter(function (x) { return typeof x === 'string'; }).slice(0,2).map(function (x) { return x.slice(0,1000); }) : [], streak:Math.max(0,Number(c.streak)||0), fails:Math.max(0,Number(c.fails)||0), box:Math.max(0,Math.min(5,Number(c.box)||0)), due:Math.max(0,Number(c.due)||0), ease:Math.max(1.3,Math.min(5,Number(c.ease)||2.5)), interval:c.interval == null ? undefined : Math.max(0,Math.min(3650,Number(c.interval)||0)), reps:Math.max(0,Number(c.reps)||0), lapses:Math.max(0,Number(c.lapses)||0) };
          });
          safeDecks[d.source + '-' + d.target] = { source:d.source, target:d.target, cards:cards, created:Date.now() };
        });
        if (!window.confirm(tr('confirm.replace'))) return;
        // Import vocabulary and history, but do not trust arbitrary runtime fields.
        var safeHistory = {};
        Object.keys(incoming.history).filter(function (k) { return /^\d{4}-\d{2}-\d{2}$/.test(k); }).forEach(function (k) {
          var h = incoming.history[k] || {}; safeHistory[k] = { answers:Math.max(0,Number(h.answers)||0), correct:Math.max(0,Number(h.correct)||0), celebrated:!!h.celebrated };
        });
        var safeStreak = { count:Math.max(0,Number(incoming.streak.count)||0), last:/^\d{4}-\d{2}-\d{2}$/.test(incoming.streak.last || '') ? incoming.streak.last : null, freezes:Math.max(0,Math.min(2,Number(incoming.streak.freezes)||0)), enabled:incoming.streak.enabled !== false };
        ['checked','protectedThrough'].forEach(function (key) { if (/^\d{4}-\d{2}-\d{2}$/.test(incoming.streak[key] || '')) safeStreak[key] = incoming.streak[key]; });
        library = { decks:safeDecks, history:safeHistory, goal:Math.max(1,Math.min(200,Number(incoming.goal)||10)), batch:[10,20,30].indexOf(Number(incoming.batch)) >= 0 ? Number(incoming.batch) : 0, streak:safeStreak };
        L.reconcile(library.streak,L.day()); persistLibrary(); renderLibrary(); renderDaily(); toast(tr('toast.restored'), 'ok');
      } catch(err) { toast(err.message || tr('err.readFile'), 'err'); }
      this.value = '';
    };
    $('typingForm').onsubmit = checkTypedAnswer;
    $('btnNextAnswer').onclick = function () {
      $('answerFeedback').hidden = true;
      // A correct typed answer after a hint is scheduled as "hard".
      if (pendingTypedAnswer !== null) { var ok = pendingTypedAnswer; pendingTypedAnswer = null; answer(ok, ok && state.hintLevel ? 'hard' : null); }
      else { updateRows(); }
    };
    $('btnQuizStart').onclick = function () {
      var d = library.decks[$('quizDeck').value];
      if (!d) { toast(tr('toast.createDeck'), 'err'); return; }
      var questions = L.quiz(d.cards, 5);
      if (!questions.length) { toast(tr('toast.need4'), 'err'); return; }
      lexical = { questions: questions, index: 0, correct: 0, answered: false };
      $('quizBody').hidden = false; $('btnQuizStart').hidden = true; renderQuiz();
    };
    $('btnQuizNext').onclick = function () {
      if (!lexical || !lexical.answered) return;
      lexical.index++; lexical.answered = false;
      if (lexical.index < lexical.questions.length) { renderQuiz(); return; }
      L.complete(library.streak, L.day()); persistLibrary(); renderDaily();
      $('quizProgress').textContent = tr('quiz.done');
      $('quizQuestion').textContent = tr('quiz.score', { c: lexical.correct, n: lexical.questions.length });
      $('quizOptions').innerHTML = ''; $('quizAnswer').textContent = tr('quiz.saved');
      $('btnQuizNext').hidden = true; $('btnQuizStart').hidden = false;
    };
  }

  /* ---------------- init ---------------- */

  function refreshLanguage() {
    updateSoundUI(); updateApiStatus(); updateInputStat(true);
    if (!L) return;
    renderDaily();
    if ($('screen-library').classList.contains('active')) renderLibrary();
    if ($('screen-test').classList.contains('active') && !lexical) fillQuizDecks();
    if (state.cards.length) $('topPill').textContent = trn('pill.cards', state.cards.length);
    if (state.summaryMsg) $('summaryMsg').textContent = summaryMessage();
    if (state.current && $('screen-train').classList.contains('active') && !state.revealed && !answerLocked) renderCard();
    toast(tr('toast.uiLang'), 'ok', 1400);
  }

  function init() {
    loadCfg();
    if (L) {
      // Offline support and "install app"; plain http (except localhost) cannot register workers.
      if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(function () {});
      var installEvt = null;
      window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; $('btnInstall').hidden = false; });
      window.addEventListener('appinstalled', function () { $('btnInstall').hidden = true; });
      window.addEventListener('offline', function () { toast(tr('toast.offline'), 'err', 4000); });
      window.addEventListener('online', function () { toast(tr('toast.online'), 'ok', 2000); retryMissingTranslations(); });
      setTimeout(retryMissingTranslations, 4000);
      $('btnInstall').addEventListener('click', async function () {
        if (!installEvt) return;
        installEvt.prompt();
        try { await installEvt.userChoice; } catch (e) {}
        installEvt = null; $('btnInstall').hidden = true;
      });
    }
    if (I18N) {
      I18N.apply();
      var uiSel = $('uiLang');
      uiSel.value = I18N.lang();
      uiSel.addEventListener('change', function () { I18N.set(uiSel.value); });
      I18N.onChange(refreshLanguage);
    }
    updateSoundUI();
    checkServerStatus();
    // Editorial edition deliberately has no ambient particle or parallax loop.
    if (L) initLearningUI();

    var sel = $('targetLang');
    LANGS.forEach(function (l) {
      var o = document.createElement('option');
      o.value = l.code; o.textContent = l.label;
      sel.appendChild(o);
    });
    sel.value = state.cfg.target;
    $('cfgBaseUrl').value = state.cfg.baseUrl;
    $('cfgModel').value = state.cfg.model;
    $('cfgKey').value = state.cfg.apiKey;
    setDir(state.cfg.dir);

    try {
      var s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      if (s && s.cards && s.cards.length) $('resumeBox').hidden = false;
    } catch (e) {}

    updateInputStat(true);

    /* setup events */
    $('input').addEventListener('input', updateInputStat);
    $('btnClear').addEventListener('click', function () {
      $('input').value = '';
      updateInputStat();
      $('input').focus();
    });

    $('btnPaste').addEventListener('click', async function () {
      try {
        var clip = await navigator.clipboard.readText();
        if (!clip) return toast(tr('toast.clipEmpty'), 'err');
        $('input').value = ($('input').value ? $('input').value.replace(/\s*$/, '\n') : '') + clip;
        updateInputStat();
        toast(tr('toast.pasted'), 'ok', 1400);
      } catch (e) {
        toast(tr('toast.clipBlocked'), 'err', 4000);
      }
    });

    /* Preset chips */
    document.querySelectorAll('.preset-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.preset;
        if (PRESETS[key]) {
          $('input').value = PRESETS[key].join('\n');
          updateInputStat(true);
          toast(tr('toast.preset', { n: btn.textContent }), 'ok', 1800);
        }
      });
    });

    /* Provider chips */
    document.querySelectorAll('.prov-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.prov-chip').forEach(function (c) { c.classList.remove('active'); });
        btn.classList.add('active');
        var p = btn.dataset.prov;
        if (p === 'free') {
          $('cfgKey').value = '';
          state.cfg.apiKey = '';
          toast(tr('toast.provFree'), 'ok');
        } else if (p === 'openai') {
          $('cfgBaseUrl').value = 'https://api.openai.com/v1';
          $('cfgModel').value = 'gpt-4o-mini';
          $('cfgKey').focus();
          toast(tr('toast.provOpenai'), 'ok');
        } else if (p === 'groq') {
          $('cfgBaseUrl').value = 'https://api.groq.com/openai/v1';
          $('cfgModel').value = 'llama-3.3-70b-versatile';
          $('cfgKey').focus();
          toast(tr('toast.provGroq'), 'ok');
        } else if (p === 'openrouter') {
          $('cfgBaseUrl').value = 'https://openrouter.ai/api/v1';
          $('cfgModel').value = 'google/gemini-2.5-flash';
          $('cfgKey').focus();
          toast(tr('toast.provOpenrouter'), 'ok');
        }
      });
    });

    sel.addEventListener('change', function () {
      var prev = state.cfg.target; state.cfg.target = sel.value;
      if (L && state.cfg.source === sel.value) { state.cfg.source = prev; $('sourceLang').value = prev; }
      saveCfg();
    });
    $('dirSeg').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-dir]');
      if (b) setDir(b.dataset.dir);
    });

    $('btnSaveCfg').addEventListener('click', function () {
      state.cfg.baseUrl = $('cfgBaseUrl').value.trim() || 'https://api.openai.com/v1';
      state.cfg.model = $('cfgModel').value.trim() || 'gpt-4o-mini';
      state.cfg.apiKey = $('cfgKey').value.trim();
      saveCfg();
      toast(tr('toast.cfgSaved'), 'ok');
    });

    $('btnResetCfg').addEventListener('click', function () {
      state.cfg.baseUrl = 'https://api.openai.com/v1';
      state.cfg.model = 'gpt-4o-mini';
      state.cfg.apiKey = '';
      $('cfgBaseUrl').value = state.cfg.baseUrl;
      $('cfgModel').value = state.cfg.model;
      $('cfgKey').value = '';
      saveCfg();
      toast(tr('toast.cfgReset'), 'ok');
    });

    $('btnStart').addEventListener('click', start);
    $('btnDemo').addEventListener('click', function () {
      state.cfg.target = 'ru'; state.cfg.source = 'en'; $('targetLang').value = 'ru'; if (L) $('sourceLang').value = 'en'; saveCfg();
      toast(tr('toast.demo'), 'ok');
      startTraining(demoCards());
    });

    $('btnResume').addEventListener('click', function () {
      try {
        var s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (s && s.cards && s.cards.length) {
          if (s.source) state.cfg.source = s.source;
          if (s.target) { state.cfg.target = s.target; $('targetLang').value = s.target; }
          if (s.dir) setDir(s.dir);
          startTraining(s.cards, s);
        }
      } catch (e) { toast(tr('toast.resumeFail'), 'err'); }
    });

    $('btnCancel').addEventListener('click', function () {
      state.cancelled = true;
      show('screen-setup');
    });

    $('btnSound').addEventListener('click', toggleSound);

    $('btnSettings').addEventListener('click', function () {
      show('screen-setup');
      $('apiBox').open = true;
      setTimeout(function () { $('apiBox').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
    });

    $('logoHome').addEventListener('click', function (e) {
      e.preventDefault();
      if ($('screen-train').classList.contains('active')) {
        showSummary();
      } else {
        state.cancelled = true;
        show('screen-setup');
      }
    });

    /* Card face speak buttons */
    $('btnSpeakFront').addEventListener('click', function (e) {
      e.stopPropagation();
      if (isListen()) speakCurrent();
      else if (state.current) speakText($('cardWord').textContent, state.curSide === 'fwd' ? state.cfg.source : state.cfg.target);
    });
    $('btnSpeakBack').addEventListener('click', function (e) {
      e.stopPropagation();
      if (state.current) speakText($('cardTrans').textContent, state.curSide === 'fwd' ? state.cfg.target : state.cfg.source);
    });
    $('btnSpeakCur').addEventListener('click', speakCurrent);

    /* Training buttons */
    $('btnReveal').addEventListener('click', reveal);
    $('btnKnew').addEventListener('click', function () { answer(true); });
    $('btnForgot').addEventListener('click', function () { answer(false); });
    $('btnKnew2').addEventListener('click', function () { answer(true); });
    $('btnHard').addEventListener('click', function () { answer(true, 'hard'); });
    $('btnEasy').addEventListener('click', function () { answer(true, 'easy'); });
    $('card').addEventListener('click', toggleCard);
    $('card').addEventListener('vm-swipe', function (e) { if (state.cfg.mode === 'flashcard' && state.revealed && !answerLocked) answer(e.detail.known); });

    /* Мягкий 3D-наклон карточки за курсором (только мышь + если нет reduced-motion) */
    try {
      var canTilt = !L && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        !(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (canTilt) {
        var cardEl = $('card');
        cardEl.addEventListener('pointermove', function (e) {
          var r = cardEl.getBoundingClientRect();
          if (!r.width || !r.height) return;
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          cardEl.style.transform = 'perspective(1200px) rotateX(' + (-py * 6).toFixed(2) +
            'deg) rotateY(' + (px * 7).toFixed(2) + 'deg)';
        });
        cardEl.addEventListener('pointerleave', function () { cardEl.style.transform = ''; });
      }
    } catch (e) {}
    $('btnExit').addEventListener('click', showSummary);

    $('btnShuffle').addEventListener('click', function () {
      shuffle(state.roundQueue);
      if (window.VMMotion) updateNextPreview();
      toast(tr('toast.shuffled'), 'ok', 1400);
      renderStats();
    });

    $('btnDirCycle').addEventListener('click', function () {
      var order = ['mixed', 'fwd', 'rev'];
      var next = order[(order.indexOf(state.cfg.dir) + 1) % order.length];
      setDir(next); saveCfg();
      if (window.VMMotion) { state.previewId = null; updateNextPreview(); }
      toast(tr('toast.dir', { d: tr('dir.' + next) }), 'ok', 1800);
    });

    /* Summary and tools buttons */
    $('btnContinue').addEventListener('click', hideSummary);
    $('btnNewSet').addEventListener('click', startNewSet);
    var btnNewSetTrain = $('btnNewSetTrain');
    if (btnNewSetTrain) {
      btnNewSetTrain.addEventListener('click', startNewSet);
    }
    $('btnCopyStats').addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(statsText());
        toast(tr('toast.statsCopied'), 'ok');
      } catch (e) { toast(tr('toast.copyFail'), 'err'); }
    });

    /* Global keyboard shortcuts */
    document.addEventListener('keydown', function (e) {
      // Alt+X swaps languages on the setup screen, even while typing the word list.
      if (L && e.altKey && e.code === 'KeyX' && $('screen-setup').classList.contains('active')) { e.preventDefault(); swapLanguages(); return; }
      if (e.target.matches('input,textarea,select')) return;
      var k = e.key;
      if (L && answerLocked) return;
      if (L && !$('answerFeedback').hidden && k === 'Enter') { e.preventDefault(); $('btnNextAnswer').click(); return; }
      if (isTyping() && $('screen-train').classList.contains('active') && $('summary').hidden) {
        if (k === 'Escape') showSummary();
        else if (k === 'u' || k === 'U' || k === 'г' || k === 'Г') undoAnswer();
        return;
      }

      if ($('screen-train').classList.contains('active') && $('summary').hidden) {
        if (k === ' ' || k === 'Enter' || k === 'ArrowDown') {
          e.preventDefault();
          pulseHint(0);
          if (k === ' ') toggleCard();
          else state.revealed ? answer(true) : reveal();
        } else if (k === '1' || k === 'ArrowLeft') {
          e.preventDefault();
          pulseHint(1);
          state.revealed ? answer(false) : reveal();
        } else if (k === '2' || k === 'ArrowRight') {
          e.preventDefault();
          pulseHint(2);
          answer(true);
        } else if (L && (k === '3' || k === '4')) {
          e.preventDefault();
          if (state.revealed) answer(true, k === '3' ? 'hard' : 'easy'); else reveal();
        } else if (k === 's' || k === 'S' || k === 'ы' || k === 'Ы') {
          e.preventDefault();
          pulseHint(3);
          speakCurrent();
        } else if (L && (k === 'h' || k === 'H' || k === 'р' || k === 'Р')) {
          e.preventDefault();
          pulseHint(5);
          showHint();
        } else if (L && (k === 'u' || k === 'U' || k === 'г' || k === 'Г' || ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ'))) {
          e.preventDefault();
          pulseHint(6);
          undoAnswer();
        } else if (k === 'm' || k === 'M' || k === 'ь' || k === 'Ь') {
          e.preventDefault();
          toggleSound();
        } else if (k === 'Escape') {
          e.preventDefault();
          pulseHint(4);
          showSummary();
        }
      } else if (!$('summary').hidden && k === 'Escape') {
        hideSummary();
      }
    });

    window.addEventListener('popstate', function () {
      if ($('screen-train').classList.contains('active')) {
        showSummary();
      }
    });
  }

  function setDir(dir) {
    state.cfg.dir = dir;
    document.querySelectorAll('#dirSeg button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.dir === dir);
    });
    saveCfg();
  }

  var statTimer = null;
  function updateInputStat(silent) {
    clearTimeout(statTimer);
    var applyStats = function () {
      var val = $('input').value;
      var p = parseInput(val);
      $('inputStat').textContent = trn('words.count', p.items.length) + (p.dropped ? tr('words.dropped', { n: p.dropped }) : '');

      // Legacy auto-detection is retained for old embeds, not explicit language selectors.
      if (L) return;
      // Smart target language switch on Cyrillic/Latin script detection
      var scr = detectScript(val);
      var sel = $('targetLang');
      if (scr === 'ru' && state.cfg.target === 'ru') {
        state.cfg.target = 'en';
        if (sel) sel.value = 'en';
        saveCfg();
        if (!silent) toast('Обнаружен русский текст → переводим на English', 'ok', 1800);
      } else if (scr === 'en' && state.cfg.target === 'en') {
        state.cfg.target = 'ru';
        if (sel) sel.value = 'ru';
        saveCfg();
        if (!silent) toast('Обнаружен английский текст → переводим на Русский', 'ok', 1800);
      }
    };
    if (silent) {
      applyStats();
    } else {
      statTimer = setTimeout(applyStats, 180);
    }
  }

  function plural(n, forms) {
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
    return forms[2];
  }

  document.addEventListener('DOMContentLoaded', init);
})();
