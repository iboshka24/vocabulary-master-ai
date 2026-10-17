/* Editorial motion system. UI choreography + genuine EffectCraft Lottie exports.
 * Every motion is finite, interruptible and optional; content never depends on it.
 */
(function () {
  'use strict';
  var systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motionChoice = 'system';
  try { motionChoice = localStorage.getItem('vm.motion') || 'system'; } catch (e) {}
  var reduced = { get matches() { return motionChoice === 'off' || (motionChoice !== 'on' && systemMotion.matches); } };
  function updateMotionPreference() {
    document.documentElement.dataset.motion = reduced.matches ? 'off' : 'on';
    var button = document.getElementById('btnMotion');
    if (button) {
      button.setAttribute('aria-pressed', String(!reduced.matches));
      button.setAttribute('aria-label', reduced.matches ? 'Включить полные 3D-анимации' : 'Выключить анимации');
      button.title = reduced.matches ? 'Движение выключено. Нажми для полного 3D.' : 'Полные 3D-анимации включены';
      button.classList.toggle('active', !reduced.matches);
    }
  }
  updateMotionPreference();
  var active = new Set(), players = new Map(), goalTimer;
  var flipUntil = 0, heroTimers = [], cardAnimations = [], heroBack = false;
  var ease = 'cubic-bezier(.22, 1, .36, 1)';
  function animate(el, frames, opts) {
    if (!el || reduced.matches || !el.animate || document.hidden) return;
    var animation = el.animate(frames, Object.assign({ duration: 460, easing: ease }, opts));
    active.add(animation);
    animation.finished.then(function () { active.delete(animation); }, function () { active.delete(animation); });
    return animation;
  }
  function enter(elements, delay) {
    Array.from(elements).forEach(function (el, i) {
      animate(el, [{ opacity: 0, translate: '0 18px' }, { opacity: 1, translate: '0 0' }], { duration: 620, delay: Math.min(i * (delay || 65), 260), fill: 'backwards' });
    });
  }
  function screen(id) {
    // Avoid accumulating entrance animations when navigation is clicked rapidly.
    active.forEach(function (a) { a.cancel(); }); active.clear();
    heroTimers.forEach(clearTimeout); heroTimers = []; flipUntil = 0;
    resetTilt();
    var root = document.getElementById(id);
    if (!root) return;
    if (id === 'screen-setup') {
      enter(root.querySelectorAll('.hero-copy > *, .paper-scene'), 70);
      heroIntro();
    } else {
      enter(root.querySelectorAll('.workspace-heading, .library-intro, .daily-panel, .stats, .quiz-panel'), 65);
    }
    revealVisible(root);
  }
  var observer = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      enter([entry.target]);
    });
  }, { threshold: .1 }) : null;
  function revealVisible(root) {
    if (!observer) return;
    observer.disconnect();
    root.querySelectorAll('.setup-grid > .panel, .deck-item, .welcome-copy, .motion-details').forEach(function (el) { observer.observe(el); });
  }
  function play(id) {
    var host = document.getElementById(id);
    if (!host || !window.lottie || !window.VM_EDITORIAL_MOTION) return;
    var player = players.get(id);
    if (!player) {
      // Lottie normalizes animationData in place: each player gets its own copy.
      player = window.lottie.loadAnimation({
        container: host, renderer: 'svg', loop: false, autoplay: false,
        animationData: JSON.parse(JSON.stringify(window.VM_EDITORIAL_MOTION)),
        rendererSettings: { progressiveLoad: false, preserveAspectRatio: 'xMidYMid meet' }
      });
      players.set(id, player);
    }
    if (reduced.matches || document.hidden) player.goToAndStop(player.totalFrames - 1, true);
    else player.goToAndPlay(0, true);
  }
  function summary(hasAnswers) {
    var host = document.getElementById('summaryMotion');
    if (host) host.hidden = !hasAnswers;
    if (hasAnswers) play('summaryMotion');
    enter(document.querySelectorAll('#summary .summary-card, #summary .summary-grid > div'), 45);
  }
  function goal() {
    var host = document.getElementById('goalCelebration');
    if (!host) return;
    clearTimeout(goalTimer); host.hidden = false;
    animate(host, [{ opacity: 0, translate: '0 20px', scale: '.96' }, { opacity: 1, translate: '0 0', scale: '1' }]);
    play('goalMotion');
    goalTimer = setTimeout(function () { host.hidden = true; stop('goalMotion'); }, 5200);
  }
  function stop(id) { var p = players.get(id); if (p) p.pause(); }
  function card() {
    cardAnimations.forEach(function (a) { if (a) a.cancel(); }); cardAnimations = [];
    flipUntil = 0; resetTilt();
    var el = document.getElementById('card');
    if (!el) return;
    el.dataset.phase = 'ready';
    var verdict = document.getElementById('cardVerdict');
    if (verdict) verdict.className = 'card-verdict';
    cardAnimations.push(animate(el, [
      { opacity: 0, transform: 'translate3d(0,65px,-100px) rotateX(16deg) rotateY(-12deg) rotateZ(-7deg) scale(.86)', offset: 0 },
      { opacity: 1, transform: 'translate3d(0,-9px,0) rotateX(-2deg) rotateY(2deg) rotateZ(1deg) scale(1.015)', offset: .72 },
      { opacity: 1, transform: 'translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1)', offset: 1 }
    ], { duration: 700 }));
    animate(document.querySelector('.sheet-near'), [
      { transform: 'translateY(25px) rotate(-1deg) scale(.96)' },
      { transform: 'translateY(13px) rotate(2deg) scale(.98)' }
    ], { duration: 660 });
  }
  function resetTilt() {
    var el = document.querySelector('.card-tilt');
    if (el) { el.style.setProperty('--tilt-x', '0deg'); el.style.setProperty('--tilt-y', '0deg'); }
  }
  function flip(showBack) {
    resetTilt();
    flipUntil = reduced.matches ? 0 : performance.now() + 920;
    var el = document.querySelector('#card .card-inner');
    var from = showBack === false ? 180 : 0, to = showBack === false ? 0 : 180;
    cardAnimations.push(animate(el, [
      { transform: 'rotateY(' + from + 'deg) translateZ(0) rotateZ(0deg)', offset: 0 },
      { transform: 'rotateY(88deg) translateZ(55px) rotateZ(-4deg)', offset: .46 },
      { transform: 'rotateY(' + (to + (to ? 8 : -8)) + 'deg) translateZ(8px) rotateZ(1deg)', offset: .82 },
      { transform: 'rotateY(' + to + 'deg) translateZ(0) rotateZ(0deg)', offset: 1 }
    ], { duration: 920, easing: 'cubic-bezier(.45,0,.2,1)' }));
  }
  function depart(ok) {
    var el = document.getElementById('card');
    if (!el || reduced.matches || document.hidden) return 0;
    el.dataset.phase = 'leaving'; resetTilt();
    var wait = Math.max(0, flipUntil - performance.now());
    var distance = Math.min(el.offsetWidth * .38, 210);
    var duration = ok ? 640 : 700;
    // A correct card arcs into the learned pile. A mistake rolls under the deck.
    var frames = ok ? [
      { transform: 'translate3d(0,0,0) rotateZ(0) scale(1)', opacity: 1, offset: 0 },
      { transform: 'translate3d(' + distance*.25 + 'px,-36px,40px) rotateZ(7deg) scale(1.03)', opacity: 1, offset: .32 },
      { transform: 'translate3d(' + distance + 'px,-115px,-70px) rotateY(-24deg) rotateZ(22deg) scale(.75)', opacity: 0, offset: 1 }
    ] : [
      { transform: 'translate3d(0,0,0) rotateZ(0) scale(1)', opacity: 1, offset: 0 },
      { transform: 'translate3d(-32px,8px,15px) rotateZ(-7deg) scale(1.01)', opacity: 1, offset: .24 },
      { transform: 'translate3d(-' + distance*.6 + 'px,75px,-130px) rotateX(24deg) rotateZ(-14deg) scale(.84)', opacity: .7, offset: .7 },
      { transform: 'translate3d(0,36px,-220px) rotateX(16deg) rotateZ(-4deg) scale(.78)', opacity: 0, offset: 1 }
    ];
    cardAnimations.push(animate(el, frames, { duration: duration, delay: wait, fill: 'forwards', easing: 'cubic-bezier(.5,0,.25,1)' }));
    var verdict = document.getElementById('cardVerdict');
    if (verdict) {
      verdict.textContent = ok ? '✓  В памяти' : '↻  Вернётся в колоду';
      verdict.className = 'card-verdict ' + (ok ? 'is-known' : 'is-repeat');
      animate(verdict, [{ opacity: 0, transform: 'translateY(12px) scale(.8)' }, { opacity: 1, transform: 'translateY(-16px) scale(1)', offset: .4 }, { opacity: 0, transform: 'translateY(-45px) scale(1)' }], { duration: duration, delay: wait });
    }
    animate(document.querySelector('.sheet-near'), [
      { transform: 'translateY(13px) rotate(2deg) scale(.98)' },
      { transform: 'translateY(-5px) rotate(-1deg) scale(1)', offset: .65 },
      { transform: 'translateY(13px) rotate(2deg) scale(.98)' }
    ], { duration: duration + 250, delay: wait });
    return Math.ceil(wait + duration);
  }
  function heroFlip(force) {
    heroBack = typeof force === 'boolean' ? force : !heroBack;
    var button = document.getElementById('heroFlip');
    if (!button) return;
    var from = heroBack ? 0 : 180, to = heroBack ? 180 : 0;
    button.setAttribute('aria-pressed', String(heroBack));
    button.classList.toggle('is-flipped', heroBack);
    animate(button.querySelector('.hero-turner'), [
      { transform:'rotateY(' + from + 'deg) rotateX(0)' },
      { transform:'rotateY(' + (from+to)/2 + 'deg) rotateX(-12deg) translateZ(40px)', offset:.48 },
      { transform:'rotateY(' + (to + (heroBack ? 7 : -7)) + 'deg) rotateX(2deg)', offset:.82 },
      { transform:'rotateY(' + to + 'deg) rotateX(0)' }
    ], { duration:1100, easing:'cubic-bezier(.45,0,.2,1)' });
  }
  function heroIntro() {
    document.querySelectorAll('.paper-scene .behind').forEach(function (el, i) {
      animate(el, [{ transform:'translate(0,30px) rotate(0deg) scale(.85)', opacity:0 }, { transform:getComputedStyle(el).transform, opacity:1 }], { duration:1000, delay:200+i*130, fill:'backwards' });
    });
    if (reduced.matches) return;
    heroTimers.push(setTimeout(function () { heroFlip(true); }, 1100));
    heroTimers.push(setTimeout(function () { heroFlip(false); }, 3800));
  }
  function feedback(ok) {
    var host = document.getElementById('answerFeedback');
    animate(host, [{ opacity: 0, translate: '0 7px' }, { opacity: 1, translate: '0 0' }], { duration: 220 });
    if (!ok) animate(document.querySelector('#card .card-inner'), [
      { translate: '0 0' }, { translate: '-4px 0' }, { translate: '4px 0' }, { translate: '0 0' }
    ], { duration: 230 });
  }
  function settle() {
    active.forEach(function (a) { a.cancel(); }); active.clear();
    players.forEach(function (p) { p.goToAndStop(p.totalFrames - 1, true); });
    heroTimers.forEach(clearTimeout); heroTimers = []; flipUntil = 0; resetTilt();
  }
  systemMotion.addEventListener('change', function () { updateMotionPreference(); if (reduced.matches) settle(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) settle(); });
  window.VMMotion = { screen: screen, library: function () { revealVisible(document.getElementById('screen-library')); }, card: card, flip: flip, depart: depart, quiz: function () { enter(document.querySelectorAll('#quizQuestion, .quiz-option'), 85); }, feedback: feedback, summary: summary, goal: goal, stop: stop };
  document.addEventListener('DOMContentLoaded', function () {
    screen('screen-setup');
    var motionButton = document.getElementById('btnMotion');
    if (motionButton) motionButton.onclick = function () {
      motionChoice = reduced.matches ? 'on' : 'off';
      try { localStorage.setItem('vm.motion', motionChoice); } catch (e) {}
      updateMotionPreference();
      if (reduced.matches) settle();
      else {
        var visible = document.querySelector('.screen.active');
        if (visible) screen(visible.id);
        if (visible && visible.id === 'screen-train') card();
      }
    };
    var hero = document.getElementById('heroFlip');
    if (hero) hero.onclick = function () { heroTimers.forEach(clearTimeout); heroTimers = []; heroFlip(); };
    if (hero) hero.addEventListener('focus', function () { heroTimers.forEach(clearTimeout); heroTimers = []; });
    var cardEl = document.getElementById('card');
    if (cardEl) {
      cardEl.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || reduced.matches || performance.now() < flipUntil || cardEl.dataset.phase === 'leaving') return;
        var box = cardEl.getBoundingClientRect(), pose = cardEl.querySelector('.card-tilt');
        if (!box.width || !pose) return;
        pose.style.setProperty('--tilt-x', ((.5-(e.clientY-box.top)/box.height)*14).toFixed(2)+'deg');
        pose.style.setProperty('--tilt-y', (((e.clientX-box.left)/box.width-.5)*22).toFixed(2)+'deg');
      });
      cardEl.addEventListener('pointerleave', resetTilt);
    }
    var close = document.getElementById('closeGoalMotion');
    if (close) close.onclick = function () { clearTimeout(goalTimer); document.getElementById('goalCelebration').hidden = true; stop('goalMotion'); };
  });
})();
