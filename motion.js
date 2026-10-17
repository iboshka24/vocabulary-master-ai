/* Editorial motion system. UI choreography + genuine EffectCraft Lottie exports.
 * Every motion is finite, interruptible and optional; content never depends on it.
 */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var active = new Set(), players = new Map(), goalTimer;
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
    var root = document.getElementById(id);
    if (!root) return;
    if (id === 'screen-setup') {
      enter(root.querySelectorAll('.hero-copy > *, .paper-scene'), 70);
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
    animate(document.getElementById('card'), [
      { opacity: 0, translate: '0 14px', scale: '.985' },
      { opacity: 1, translate: '0 0', scale: '1' }
    ], { duration: 320 });
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
  }
  reduced.addEventListener('change', function () { if (reduced.matches) settle(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) settle(); });
  window.VMMotion = { screen: screen, library: function () { revealVisible(document.getElementById('screen-library')); }, card: card, feedback: feedback, summary: summary, goal: goal, stop: stop };
  document.addEventListener('DOMContentLoaded', function () {
    screen('screen-setup');
    var scene = document.querySelector('.paper-scene');
    if (scene) scene.addEventListener('pointerenter', function (event) {
      if (event.pointerType !== 'mouse') return;
      animate(scene.querySelector('.sample-card:not(.behind)'), [{ translate: '0 0', rotate: '0deg' }, { translate: '0 -9px', rotate: '3deg' }, { translate: '0 0', rotate: '0deg' }], { duration: 900 });
    });
    var close = document.getElementById('closeGoalMotion');
    if (close) close.onclick = function () { clearTimeout(goalTimer); document.getElementById('goalCelebration').hidden = true; stop('goalMotion'); };
  });
})();
