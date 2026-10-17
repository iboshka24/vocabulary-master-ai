/* Editorial motion system. UI choreography + genuine EffectCraft Lottie exports.
 * Every motion is finite, interruptible and optional; content never depends on it.
 */
(function () {
  'use strict';
  var systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motionChoice = 'system';
  try { motionChoice = localStorage.getItem('vm.motion') || 'system'; } catch (e) {}
  var reduced = { get matches() { return motionChoice === 'off' || (motionChoice !== 'on' && systemMotion.matches); } };
  function tr(key) { return window.VMI18n ? window.VMI18n.t(key) : key; }
  if (window.VMI18n) window.VMI18n.onChange(function () { updateMotionPreference(); });
  function updateMotionPreference() {
    document.documentElement.dataset.motion = reduced.matches ? 'off' : 'on';
    var button = document.getElementById('btnMotion');
    if (button) {
      button.setAttribute('aria-pressed', String(!reduced.matches));
      button.setAttribute('aria-label', tr(reduced.matches ? 'motion.onAria' : 'motion.offAria'));
      button.title = tr(reduced.matches ? 'motion.offTitle' : 'motion.onTitle');
      button.classList.toggle('active', !reduced.matches);
    }
  }
  updateMotionPreference();
  var active = new Set(), players = new Map(), goalTimer;
  var flipUntil = 0, heroTimers = [], cardAnimations = [], heroBack = false;
  var handoff = false;
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
    cardAnimations.forEach(function (a) { if (a) a.cancel(); }); cardAnimations = []; handoff = false;
    var deck = document.querySelector('.deck-stage'); if (deck) deck.classList.remove('is-swapping');
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
    var deck = document.querySelector('.deck-stage'); if (deck) deck.classList.remove('is-swapping');
    var verdict = document.getElementById('cardVerdict');
    if (verdict) verdict.className = 'card-verdict';
    // The incoming face already occupies the exact final position. Commit its
    // data to the interactive card without replaying an entrance or fading out.
    if (handoff) { handoff = false; return; }
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
    flipUntil = reduced.matches ? 0 : performance.now() + 640;
    var el = document.querySelector('#card .card-inner');
    var from = showBack === false ? 180 : 0, to = showBack === false ? 0 : 180;
    cardAnimations.push(animate(el, [
      { transform: 'rotateY(' + from + 'deg) translateZ(0) rotateZ(0deg)', offset: 0 },
      { transform: 'rotateY(88deg) translateZ(55px) rotateZ(-4deg)', offset: .46 },
      { transform: 'rotateY(' + (to + (to ? 8 : -8)) + 'deg) translateZ(8px) rotateZ(1deg)', offset: .82 },
      { transform: 'rotateY(' + to + 'deg) translateZ(0) rotateZ(0deg)', offset: 1 }
    ], { duration: 640, easing: 'cubic-bezier(.45,0,.2,1)' }));
  }
  function depart(ok) {
    var el = document.getElementById('card');
    if (!el || reduced.matches || document.hidden) { handoff = true; return 0; }
    el.dataset.phase = 'leaving'; resetTilt();
    var wait = Math.max(0, flipUntil - performance.now());
    var distance = Math.min(el.offsetWidth * .85, 470);
    var duration = 480;
    handoff = true;
    document.querySelector('.deck-stage').classList.add('is-swapping');
    var origin = el.style.transform || 'translate3d(0,0,0) rotate(0)';
    // Both faces move in one compositor timeline; the next word is real data.
    var frames = ok ? [
      { transform: origin, opacity: 1, offset: 0 },
      { transform: 'translate3d(' + distance*.6 + 'px,-25px,0) rotate(12deg)', opacity: 1, offset: .65 },
      { transform: 'translate3d(' + distance + 'px,-70px,0) rotate(21deg)', opacity: 0, offset: 1 }
    ] : [
      { transform: origin, opacity: 1, offset: 0 },
      { transform: 'translate3d(-' + distance*.6 + 'px,24px,0) rotate(-12deg) scale(.98)', opacity: 1, offset: .65 },
      { transform: 'translate3d(-' + distance + 'px,85px,0) rotate(-21deg) scale(.94)', opacity: 0, offset: 1 }
    ];
    cardAnimations.push(animate(el, frames, { duration: duration, delay: wait, fill: 'forwards', easing: 'cubic-bezier(.5,0,.25,1)' }));
    var verdict = document.getElementById('cardVerdict');
    if (verdict) {
      verdict.textContent = tr(ok ? 'verdict.ok' : 'verdict.no');
      verdict.className = 'card-verdict ' + (ok ? 'is-known' : 'is-repeat');
      animate(verdict, [{ opacity: 0, transform: 'translateY(12px) scale(.8)' }, { opacity: 1, transform: 'translateY(-16px) scale(1)', offset: .4 }, { opacity: 0, transform: 'translateY(-45px) scale(1)' }], { duration: duration, delay: wait });
    }
    cardAnimations.push(animate(document.querySelector('.sheet-near'), [
      { transform: 'translateY(13px) rotate(2deg) scale(.98)' },
      { transform: 'translateY(-4px) rotate(-.6deg) scale(1.005)', offset: .8 },
      { transform: 'translateY(0) rotate(0) scale(1)' }
    ], { duration: duration, delay: wait, fill:'forwards' }));
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
      var gesture = null, pointerFrame = 0, rect = null, lastPoint, suppressClickUntil = 0;
      function paintPointer() {
        pointerFrame = 0;
        if (!lastPoint || reduced.matches || cardEl.dataset.phase === 'leaving') return;
        if (gesture && gesture.dragging) {
          cardEl.style.transform = 'translate3d(' + gesture.dx + 'px,' + Math.abs(gesture.dx)*.07 + 'px,0) rotate(' + gesture.dx/22 + 'deg)';
          return;
        }
        if (!rect || performance.now() < flipUntil) return;
        var pose = cardEl.querySelector('.card-tilt');
        pose.style.setProperty('--tilt-x', ((.5-(lastPoint.y-rect.top)/rect.height)*14).toFixed(2)+'deg');
        pose.style.setProperty('--tilt-y', (((lastPoint.x-rect.left)/rect.width-.5)*22).toFixed(2)+'deg');
      }
      cardEl.addEventListener('pointerenter', function () { rect = cardEl.getBoundingClientRect(); });
      cardEl.addEventListener('pointerdown', function (e) {
        if (reduced.matches || e.button !== 0 || e.target.closest('button') || cardEl.dataset.swipe !== 'true' || cardEl.dataset.revealed !== 'true' || cardEl.dataset.phase !== 'ready' || performance.now() < flipUntil) return;
        rect = cardEl.getBoundingClientRect();
        gesture = { x:e.clientX, y:e.clientY, width:rect.width, dx:0, dragging:false, id:e.pointerId };
      });
      cardEl.addEventListener('pointermove', function (e) {
        if (gesture) {
          var dx = e.clientX-gesture.x, dy = e.clientY-gesture.y;
          if (!gesture.dragging && Math.abs(dy)>12 && Math.abs(dy)>Math.abs(dx)) { gesture=null; return; }
          if (!gesture.dragging && Math.abs(dx)>10 && Math.abs(dx)>Math.abs(dy)*1.2) {
            gesture.dragging=true; resetTilt(); cardEl.setPointerCapture(e.pointerId);
          }
          gesture.dx=dx;
        }
        if (e.pointerType !== 'mouse' && !(gesture && gesture.dragging)) return;
        lastPoint = {x:e.clientX,y:e.clientY};
        if (!pointerFrame) pointerFrame=requestAnimationFrame(paintPointer);
      });
      function release(e) {
        if (!gesture) return;
        var g=gesture; gesture=null;
        if (cardEl.hasPointerCapture(g.id)) cardEl.releasePointerCapture(g.id);
        if (!g.dragging) return;
        suppressClickUntil=performance.now()+400;
        if (pointerFrame) { cancelAnimationFrame(pointerFrame); pointerFrame=0; }
        if (e.type!=='pointercancel' && Math.abs(g.dx)>Math.min(120,g.width*.23)) {
          cardEl.dispatchEvent(new CustomEvent('vm-swipe',{detail:{known:g.dx>0}}));
        } else {
          var from=cardEl.style.transform;
          cardEl.style.transform='';
          cardAnimations.push(animate(cardEl,[{transform:from},{transform:'translate3d(0,0,0) rotate(0)'}],{duration:240}));
        }
      }
      cardEl.addEventListener('pointerup',release);
      cardEl.addEventListener('pointercancel',release);
      cardEl.addEventListener('click',function(e) { if(performance.now()<suppressClickUntil) {e.preventDefault();e.stopImmediatePropagation();} },true);
      cardEl.addEventListener('pointerleave', resetTilt);
      window.addEventListener('resize',function(){rect=null;});
    }
    var close = document.getElementById('closeGoalMotion');
    if (close) close.onclick = function () { clearTimeout(goalTimer); document.getElementById('goalCelebration').hidden = true; stop('goalMotion'); };
  });
})();
